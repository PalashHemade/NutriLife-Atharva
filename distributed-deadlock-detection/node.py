#!/usr/bin/env python3
"""
Entry point for one node in the distributed deadlock-detection demo.

Run two of these (see SCENARIO.md for exact commands) and they'll:
  1. connect to each other over TCP,
  2. hold a Bully election to pick a leader,
  3. let you simulate processes acquiring/waiting-for resources via a
     simple CLI,
  4. have the elected leader continuously merge every node's wait-for
     graph and detect + resolve cross-node deadlocks.

Example:
    python node.py --id 1 --port 5001 --peer 2:localhost:5002
    python node.py --id 2 --port 5002 --peer 1:localhost:5001
"""

from __future__ import annotations

import argparse
import logging
import sys
import threading
import time

from bully import BullyElection
from deadlock import DeadlockDetector
from network import NetworkManager
from protocol import global_id, split_global_id
from resource_manager import ResourceManager


def parse_peer(spec: str) -> tuple[int, str, int]:
    node_id_s, host, port_s = spec.split(":")
    return int(node_id_s), host, int(port_s)


def setup_logging(node_id: int) -> None:
    class TaggedFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            record.tag = record.name.upper()
            return super().format(record)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        TaggedFormatter(f"%(asctime)s [NODE {node_id}] [%(tag)s] %(message)s", datefmt="%H:%M:%S")
    )
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)


HELP_TEXT = """\
Commands:
  acquire <P> <R>   process P requests resource R (e.g. "acquire P1 R1" for
                     your own resource, "acquire P1 2.R2" for node 2's)
  request <P> <R>   same as acquire (alias, matches wait-for-graph wording)
  release <P> <R>   process P releases resource R
  status            show this node's resources, holders, queues, wait-edges
  leader            show who this node currently believes is the leader
  peers             show which peers we have a live connection to
  help              show this again
  quit / exit       shut down this node
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Distributed deadlock-detection demo node")
    parser.add_argument("--id", type=int, required=True, help="this node's numeric id")
    parser.add_argument("--port", type=int, required=True, help="TCP port this node listens on")
    parser.add_argument(
        "--peer",
        action="append",
        default=[],
        metavar="ID:HOST:PORT",
        help="another node to connect to, e.g. 2:localhost:5002 (repeatable)",
    )
    parser.add_argument("--election-timeout", type=float, default=2.0)
    parser.add_argument("--heartbeat-interval", type=float, default=1.0)
    parser.add_argument("--heartbeat-timeout", type=float, default=3.5)
    parser.add_argument("--detect-interval", type=float, default=2.0)
    parser.add_argument("--wfg-report-interval", type=float, default=1.5)
    args = parser.parse_args()

    setup_logging(args.id)
    log = logging.getLogger("node")

    peers: dict[int, tuple[str, int]] = {}
    for spec in args.peer:
        peer_id, host, port = parse_peer(spec)
        peers[peer_id] = (host, port)

    network = NetworkManager(args.id, args.port, peers)
    resources = ResourceManager(args.id, send=network.send)
    resources.declare_resource(f"R{args.id}")

    bully = BullyElection(
        node_id=args.id,
        peer_ids=list(peers.keys()),
        send=network.send,
        broadcast=network.broadcast,
        on_become_leader=lambda: deadlock.start(),
        on_lose_leadership=lambda: deadlock.stop(),
        election_timeout=args.election_timeout,
        heartbeat_interval=args.heartbeat_interval,
        heartbeat_timeout=args.heartbeat_timeout,
    )

    deadlock = DeadlockDetector(
        node_id=args.id,
        own_edges=resources.edges_for_report,
        send=network.send,
        abort_local=resources.abort_local_process,
        detect_interval=args.detect_interval,
    )

    def dispatch(peer_id: int, message: dict) -> None:
        kind = message.get("type")
        try:
            if kind == "ELECTION":
                bully.on_election(message["from"])
            elif kind == "OK":
                bully.on_ok(message["from"])
            elif kind == "COORDINATOR":
                bully.on_coordinator(message["from"])
            elif kind == "HEARTBEAT":
                bully.on_heartbeat(message["from"])
            elif kind == "RESOURCE_REQUEST":
                resources.on_resource_request(peer_id, message["process"], message["resource"])
            elif kind == "RESOURCE_RELEASE":
                resources.on_resource_release(message["process"], message["resource"])
            elif kind == "RESOURCE_GRANTED":
                resources.on_resource_granted(message["process"], message["resource"])
            elif kind == "RESOURCE_WAIT":
                resources.on_resource_wait(message["process"], message["resource"], message["holder"])
            elif kind == "RESOURCE_CANCEL":
                resources.on_resource_cancel(message["process"], message["resource"])
            elif kind == "WFG_REPORT":
                deadlock.on_wfg_report(peer_id, message["edges"])
            elif kind == "ABORT":
                resources.abort_local_process(message["process"], message.get("reason", "deadlock resolution"))
            else:
                logging.getLogger("node").warning("unknown message type from %d: %r", peer_id, kind)
        except (KeyError, ValueError) as exc:
            logging.getLogger("node").error("malformed message from %d: %s (%r)", peer_id, exc, message)

    network.set_handlers(on_message=dispatch)
    network.start()
    bully.start()

    # Give connections a moment to establish, then hold the first election.
    # (If a higher-id peer isn't up yet, this node will briefly lead alone
    # and hand off leadership the moment that peer boots and runs its own
    # startup election - that's expected Bully behaviour, not a bug.)
    threading.Timer(1.5, bully.start_election).start()

    def wfg_report_loop() -> None:
        while True:
            time.sleep(args.wfg_report_interval)
            leader = bully.leader_id
            if leader is not None and leader != args.id:
                network.send(leader, {"type": "WFG_REPORT", "from": args.id, "edges": resources.edges_for_report()})

    threading.Thread(target=wfg_report_loop, daemon=True).start()

    log.info("node %d up - listening on %d, peers=%s", args.id, args.port, peers)
    print(HELP_TEXT)

    try:
        run_cli(args.id, bully, resources, network)
    except (KeyboardInterrupt, EOFError):
        pass
    finally:
        print("\nshutting down...")
        bully.stop()
        deadlock.stop()
        network.stop()


def resolve_resource(my_id: int, token: str) -> str:
    """'R1' -> '<my_id>.R1'; '2.R2' is left as-is."""
    if "." in token:
        split_global_id(token)  # validates the format, raises if malformed
        return token
    return global_id(my_id, token)


def run_cli(my_id: int, bully: BullyElection, resources: ResourceManager, network: NetworkManager) -> None:
    for raw in sys.stdin:
        parts = raw.strip().split()
        if not parts:
            continue
        cmd, *rest = parts

        if cmd in ("acquire", "request") and len(rest) == 2:
            process, resource = rest
            resources.acquire(process, resolve_resource(my_id, resource))
        elif cmd == "release" and len(rest) == 2:
            process, resource = rest
            resources.release(process, resolve_resource(my_id, resource))
        elif cmd == "status":
            print(resources.status())
        elif cmd == "leader":
            print(f"current leader: {bully.leader_id}")
        elif cmd == "peers":
            print(f"connected peers: {network.connected_peers()}")
        elif cmd == "help":
            print(HELP_TEXT)
        elif cmd in ("quit", "exit"):
            return
        else:
            print(f"unrecognized command: {raw.strip()!r} (type 'help')")


if __name__ == "__main__":
    main()
