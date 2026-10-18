"""
Leader-side distributed deadlock detection.

Every node periodically reports its local wait-for-graph edges to whoever
it currently believes is the leader (WFG_REPORT). Only the leader runs
this module's detection loop: it merges every node's latest report
(including its own) into one graph and looks for cycles.

Wait-for graph convention: an edge waiting -> holder means "waiting is
blocked, waiting for a resource currently held by holder". A cycle in
this graph is a deadlock by definition (textbook wait-for-graph theory:
a cycle exists iff a deadlock exists, assuming each resource instance is
single-unit, which holds for every resource in this demo).

Each process has at most one outstanding wait at a time in this demo (it
only ever has one thing it's blocked on), so the merged graph has out-
degree <= 1 per node - but find_cycle() below is written as a general
DFS cycle detector rather than relying on that, so it stays correct even
if that assumption is ever relaxed.

Resolution policy: when a cycle is found, abort the process in the cycle
whose wait began most recently (the "youngest" waiter) - this is the
same "abort the newcomer" heuristic real databases use to avoid starving
long-running transactions. Ties are broken by global id for determinism.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Callable

from protocol import split_global_id

log = logging.getLogger("deadlock")

# edge = [waiting_gid, holder_gid, since]
Edge = list
Graph = dict[str, list[tuple[str, float]]]


def build_graph(all_edges: list[Edge]) -> Graph:
    graph: Graph = {}
    for waiting, holder, since in all_edges:
        graph.setdefault(waiting, []).append((holder, since))
    return graph


def find_cycle(graph: Graph) -> list[str] | None:
    """DFS cycle detection with recursion-stack coloring. Returns the gids
    forming one cycle (in order), or None if the graph is acyclic."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color: dict[str, int] = {}
    path: list[str] = []

    def visit(node: str) -> list[str] | None:
        color[node] = GRAY
        path.append(node)
        for neighbour, _since in graph.get(node, []):
            state = color.get(neighbour, WHITE)
            if state == WHITE:
                found = visit(neighbour)
                if found:
                    return found
            elif state == GRAY:
                start = path.index(neighbour)
                return path[start:]
        path.pop()
        color[node] = BLACK
        return None

    for node in list(graph.keys()):
        if color.get(node, WHITE) == WHITE:
            found = visit(node)
            if found:
                return found
    return None


def choose_victim(cycle: list[str], graph: Graph) -> str:
    """Pick the cycle member whose own outgoing wait is the most recent."""
    best_gid = None
    best_since = -1.0
    for gid in cycle:
        # a node in the cycle has exactly one outgoing edge that stays
        # inside the cycle; find its "since" timestamp.
        for _holder, since in graph.get(gid, []):
            if since > best_since or (since == best_since and (best_gid is None or gid > best_gid)):
                best_since = since
                best_gid = gid
            break
    return best_gid or cycle[0]


class DeadlockDetector:
    def __init__(
        self,
        node_id: int,
        own_edges: Callable[[], list[Edge]],
        send: Callable[[int, dict], bool],
        abort_local: Callable[[str, str], None],
        detect_interval: float = 2.0,
    ) -> None:
        self.node_id = node_id
        self._own_edges = own_edges
        self._send = send
        self._abort_local = abort_local
        self.detect_interval = detect_interval

        self._lock = threading.Lock()
        self._reports: dict[int, list[Edge]] = {}
        self._running = threading.Event()
        self._thread: threading.Thread | None = None

    # ------------------------------------------------------------------
    # Called by bully.py when this node becomes / stops being leader
    # ------------------------------------------------------------------
    def start(self) -> None:
        if self._running.is_set():
            return
        self._running.set()
        log.info("this node is now LEADER - starting deadlock detection loop")
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        if self._running.is_set():
            log.info("this node is no longer leader - stopping deadlock detection loop")
        self._running.clear()

    # ------------------------------------------------------------------
    # Incoming reports from followers
    # ------------------------------------------------------------------
    def on_wfg_report(self, from_node: int, edges: list[Edge]) -> None:
        with self._lock:
            self._reports[from_node] = edges

    # ------------------------------------------------------------------
    # Detection loop (leader only)
    # ------------------------------------------------------------------
    def _loop(self) -> None:
        while self._running.is_set():
            self._detect_and_resolve()
            time.sleep(self.detect_interval)

    def _detect_and_resolve(self) -> None:
        with self._lock:
            all_edges: list[Edge] = list(self._own_edges())
            for edges in self._reports.values():
                all_edges.extend(edges)

        if not all_edges:
            return

        graph = build_graph(all_edges)
        cycle = find_cycle(graph)
        if not cycle:
            return

        victim = choose_victim(cycle, graph)
        log.warning("DEADLOCK DETECTED: %s (cycle of %d processes)", " -> ".join(cycle + [cycle[0]]), len(cycle))
        log.warning("resolution policy: abort youngest waiter -> victim = %s", victim)

        owner_node, _ = split_global_id(victim)
        if owner_node == self.node_id:
            self._abort_local(victim, "deadlock resolution (leader-local victim)")
        else:
            self._send(owner_node, {"type": "ABORT", "process": victim, "reason": "deadlock resolution"})

        # Drop any stale report data for the victim so we don't immediately
        # "detect" the same already-resolved cycle again before the owning
        # node's next WFG_REPORT catches up.
        with self._lock:
            for node_id, edges in list(self._reports.items()):
                self._reports[node_id] = [e for e in edges if e[0] != victim]
