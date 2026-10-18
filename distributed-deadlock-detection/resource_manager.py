"""
Per-node resource/process bookkeeping.

Each node owns a small set of named resources (by default one, "R<node_id>",
auto-declared at startup). Processes are just names typed at the CLI (P1,
P2, ...) - there's no real OS process behind them, they're a stand-in for
"something that can hold and wait for resources", which is all a wait-for
graph cares about.

The important design rule, which is what makes the deadlock detection
genuinely *distributed* rather than per-node-only: a wait-for edge is
always recorded on the node that is HOME to the *waiting* process, never
on the node that owns the resource. That's true whether the resource is
local or remote:

  - Local wait:  P1 (mine) waits for R1 (mine, held by P2) -> I record it.
  - Remote wait: P1 (mine) waits for R2 (owned by node 2, held by node 2's
                 P3) -> node 2 tells me who holds it, and *I* record the
                 edge "1.P1 -> 2.P3" because P1 is my process.

That means no single node's wait-for graph can show a cycle that spans
nodes - you only see it once a leader merges every node's edges together,
which is exactly the point of this demo.
"""

from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field
from typing import Callable

from protocol import global_id, split_global_id

log = logging.getLogger("resources")


@dataclass
class Resource:
    name: str
    holder: str | None = None  # global process id, or None if free
    queue: list[tuple[str, float]] = field(default_factory=list)  # (global pid, since)


class ResourceManager:
    def __init__(self, node_id: int, send: Callable[[int, dict], bool]):
        self.node_id = node_id
        self._send = send
        self._lock = threading.RLock()

        self.resources: dict[str, Resource] = {}
        # waiting LOCAL process gid -> (holder gid, since, resource gid) -
        # this node's contribution to the global wait-for graph. The
        # resource gid is kept around purely so abort() knows who to tell
        # if the wait needs to be cancelled on a remote resource's queue.
        self.local_wait_edges: dict[str, tuple[str, float, str]] = {}
        # local process name -> set of resource gids it currently holds
        # (local or remote), so abort()/release() know what to clean up.
        self.held_by: dict[str, set[str]] = {}

    # ------------------------------------------------------------------
    # Setup
    # ------------------------------------------------------------------
    def declare_resource(self, name: str) -> None:
        with self._lock:
            self.resources.setdefault(name, Resource(name=name))
        log.info("declared local resource %s", global_id(self.node_id, name))

    # ------------------------------------------------------------------
    # Public API driven by the CLI
    # ------------------------------------------------------------------
    def acquire(self, process: str, resource_gid: str) -> None:
        """Process `process` (local, short name) wants `resource_gid` (global)."""
        owner_node, resource_name = split_global_id(resource_gid)
        requester_gid = global_id(self.node_id, process)

        if owner_node == self.node_id:
            self._local_acquire(requester_gid, resource_name)
            return

        sent = self._send(
            owner_node,
            {
                "type": "RESOURCE_REQUEST",
                "process": requester_gid,
                "resource": resource_gid,
            },
        )
        if not sent:
            log.error("cannot reach node %d to request %s (not connected)", owner_node, resource_gid)

    def release(self, process: str, resource_gid: str) -> None:
        owner_node, resource_name = split_global_id(resource_gid)
        requester_gid = global_id(self.node_id, process)

        if owner_node == self.node_id:
            self._local_release(resource_name)
        else:
            self._send(owner_node, {"type": "RESOURCE_RELEASE", "process": requester_gid, "resource": resource_gid})
        with self._lock:
            self.held_by.get(process, set()).discard(resource_gid)

    def status(self) -> str:
        with self._lock:
            lines = [f"-- Node {self.node_id} status --"]
            for res in self.resources.values():
                queue = ", ".join(pid for pid, _ in res.queue) or "-"
                lines.append(f"  resource {global_id(self.node_id, res.name)}: holder={res.holder or 'free'} queue=[{queue}]")
            if self.local_wait_edges:
                lines.append("  local wait-for edges:")
                for waiting, (holder, since, _res) in self.local_wait_edges.items():
                    lines.append(f"    {waiting} -> {holder} (waiting {time.time()-since:.1f}s)")
            else:
                lines.append("  local wait-for edges: none")
            if self.held_by:
                lines.append("  held by local processes:")
                for proc, gids in self.held_by.items():
                    if gids:
                        lines.append(f"    {proc}: {sorted(gids)}")
            return "\n".join(lines)

    # ------------------------------------------------------------------
    # Internal: local resource state machine
    # ------------------------------------------------------------------
    def _local_acquire(self, requester_gid: str, resource_name: str) -> None:
        gid = global_id(self.node_id, resource_name)
        with self._lock:
            res = self.resources.setdefault(resource_name, Resource(name=resource_name))
            if res.holder == requester_gid:
                # Already holds it (e.g. a re-issued/duplicate request) -
                # re-queuing behind itself would create a nonsensical
                # self-loop wait edge, so just re-confirm the grant.
                self._notify_grant(requester_gid, gid)
                return
            if res.holder is None:
                res.holder = requester_gid
                granted = True
            else:
                res.queue.append((requester_gid, time.time()))
                granted = False
                holder = res.holder

        if granted:
            self._notify_grant(requester_gid, gid)
        else:
            self._notify_wait(requester_gid, gid, holder)

    def _local_release(self, resource_name: str) -> None:
        with self._lock:
            res = self.resources.get(resource_name)
            if res is None:
                return
            res.holder = None
            next_waiter = res.queue.pop(0) if res.queue else None
            if next_waiter is not None:
                res.holder = next_waiter[0]

        gid = global_id(self.node_id, resource_name)
        log.info("released %s", gid)
        if next_waiter is not None:
            self._notify_grant(next_waiter[0], gid)

    def _notify_grant(self, requester_gid: str, resource_gid: str) -> None:
        owner_node, proc_name = split_global_id(requester_gid)
        if owner_node == self.node_id:
            with self._lock:
                self.local_wait_edges.pop(requester_gid, None)
                self.held_by.setdefault(proc_name, set()).add(resource_gid)
            log.info("%s granted %s", requester_gid, resource_gid)
        else:
            self._send(owner_node, {"type": "RESOURCE_GRANTED", "process": requester_gid, "resource": resource_gid})

    def _notify_wait(self, requester_gid: str, resource_gid: str, holder_gid: str) -> None:
        owner_node, proc_name = split_global_id(requester_gid)
        if owner_node == self.node_id:
            with self._lock:
                self.local_wait_edges[requester_gid] = (holder_gid, time.time(), resource_gid)
            log.info("%s must wait for %s (held by %s)", requester_gid, resource_gid, holder_gid)
        else:
            self._send(
                owner_node,
                {"type": "RESOURCE_WAIT", "process": requester_gid, "resource": resource_gid, "holder": holder_gid},
            )

    # ------------------------------------------------------------------
    # Incoming network messages (called from node.py's dispatcher)
    # ------------------------------------------------------------------
    def on_resource_request(self, from_node: int, process_gid: str, resource_gid: str) -> None:
        del from_node  # kept in the signature for symmetry/logging at the call site
        _, resource_name = split_global_id(resource_gid)
        self._local_acquire(process_gid, resource_name)

    def on_resource_release(self, process_gid: str, resource_gid: str) -> None:
        del process_gid  # kept in the signature for symmetry/logging at the call site
        _, resource_name = split_global_id(resource_gid)
        self._local_release(resource_name)

    def on_resource_granted(self, process_gid: str, resource_gid: str) -> None:
        _, proc_name = split_global_id(process_gid)
        with self._lock:
            self.local_wait_edges.pop(process_gid, None)
            self.held_by.setdefault(proc_name, set()).add(resource_gid)
        log.info("%s granted %s (remote)", process_gid, resource_gid)

    def on_resource_wait(self, process_gid: str, resource_gid: str, holder_gid: str) -> None:
        with self._lock:
            self.local_wait_edges[process_gid] = (holder_gid, time.time(), resource_gid)
        log.info("%s must wait for %s (held by %s, remote)", process_gid, resource_gid, holder_gid)

    # ------------------------------------------------------------------
    # Deadlock resolution
    # ------------------------------------------------------------------
    def edges_for_report(self) -> list[list]:
        """This node's contribution to the global wait-for graph."""
        with self._lock:
            return [[waiting, holder, since] for waiting, (holder, since, _res) in self.local_wait_edges.items()]

    def abort_local_process(self, process_gid: str, reason: str) -> None:
        """
        The leader decided this (local) process is the deadlock victim:
        release everything it holds and cancel anything it's waiting on.
        """
        owner_node, proc_name = split_global_id(process_gid)
        if owner_node != self.node_id:
            log.error("asked to abort %s but that isn't a local process", process_gid)
            return

        log.warning("ABORTING %s (%s)", process_gid, reason)

        with self._lock:
            held = list(self.held_by.pop(proc_name, set()))
            pending_wait = self.local_wait_edges.pop(process_gid, None)

        # Release everything this process was holding (local or remote).
        for resource_gid in held:
            owner_node2, resource_name = split_global_id(resource_gid)
            if owner_node2 == self.node_id:
                self._local_release(resource_name)
            else:
                self._send(owner_node2, {"type": "RESOURCE_RELEASE", "process": process_gid, "resource": resource_gid})

        # If it was queued up waiting on something, cancel that wait too -
        # pulling it out of whichever resource's queue it's sitting in,
        # local or remote, so it doesn't get granted a resource later for
        # a request that no longer exists.
        if pending_wait is not None:
            _holder, _since, waited_resource_gid = pending_wait
            waited_owner, waited_resource_name = split_global_id(waited_resource_gid)
            if waited_owner == self.node_id:
                self._cancel_local_wait(process_gid, waited_resource_name)
            else:
                self._send(waited_owner, {"type": "RESOURCE_CANCEL", "process": process_gid, "resource": waited_resource_gid})

        log.warning("%s aborted and rolled back - any resources it held are now free/reassigned", process_gid)

    def _cancel_local_wait(self, process_gid: str, resource_name: str) -> None:
        with self._lock:
            res = self.resources.get(resource_name)
            if res is not None:
                res.queue = [(pid, ts) for pid, ts in res.queue if pid != process_gid]

    def on_resource_cancel(self, process_gid: str, resource_gid: str) -> None:
        """A remote process that was waiting on one of our resources got aborted."""
        _, resource_name = split_global_id(resource_gid)
        self._cancel_local_wait(process_gid, resource_name)
        log.info("removed %s from %s's wait queue (aborted elsewhere)", process_gid, resource_gid)
