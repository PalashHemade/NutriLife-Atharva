#!/usr/bin/env python3
"""
One-command, fully automated run of the whole demo.

This launches both nodes as real, separate OS subprocesses - exactly like
running them in two terminals by hand - and drives them by writing to
their stdin, so you can see the entire story (election, cross-node
deadlock formation, detection, resolution, leader crash, and leader
recovery) without typing anything yourself.

For an interactive, presentable walkthrough (e.g. for a live demo/grading
session) use two real terminals and follow SCENARIO.md instead - this
script is the "just prove it still works" button.

Usage:
    python demo_runner.py
"""

from __future__ import annotations

import subprocess
import sys
import threading
import time
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent


def stream_output(tag: str, pipe) -> None:
    for line in iter(pipe.readline, ""):
        print(f"{tag}| {line}", end="")


def start_node(node_id: int, port: int, peer_id: int, peer_port: int) -> subprocess.Popen:
    proc = subprocess.Popen(
        [
            sys.executable, "-u", "node.py",
            "--id", str(node_id),
            "--port", str(port),
            "--peer", f"{peer_id}:localhost:{peer_port}",
        ],
        cwd=PROJECT_DIR,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    threading.Thread(target=stream_output, args=(f"NODE{node_id}", proc.stdout), daemon=True).start()
    return proc


def send(proc: subprocess.Popen, command: str) -> None:
    proc.stdin.write(command + "\n")
    proc.stdin.flush()


def banner(text: str) -> None:
    print(f"\n{'=' * 70}\n{text}\n{'=' * 70}")


def main() -> None:
    banner("STARTING NODE 1 (port 5001) AND NODE 2 (port 5002)")
    node1 = start_node(1, 5001, 2, 5002)
    node2 = start_node(2, 5002, 1, 5001)
    time.sleep(5)  # let them connect and finish the first Bully election

    banner("STEP 1: each process grabs its own node's local resource")
    send(node1, "acquire P1 R1")
    send(node2, "acquire P2 R2")
    time.sleep(2)

    banner("STEP 2: cross-node requests - this manufactures a real cycle")
    send(node1, "request P1 2.R2")  # P1 (node 1) now also wants node 2's R2
    send(node2, "request P2 1.R1")  # P2 (node 2) now also wants node 1's R1
    time.sleep(4)  # give the leader's detection loop time to run

    banner("STEP 3: final state after detection + resolution")
    send(node1, "status")
    send(node2, "status")
    time.sleep(1)

    banner("STEP 4: kill the leader (node 2) and watch node 1 take over")
    node2.kill()
    time.sleep(6)
    send(node1, "leader")
    time.sleep(1)

    banner("STEP 5: restart node 2 - it should reclaim leadership")
    node2b = start_node(2, 5002, 1, 5001)
    time.sleep(5)
    send(node1, "leader")
    send(node2b, "leader")
    time.sleep(2)

    banner("DONE - shutting everything down")
    for proc in (node1, node2b):
        try:
            send(proc, "quit")
        except OSError:
            pass
    time.sleep(1)
    for proc in (node1, node2, node2b):
        try:
            proc.kill()
        except OSError:
            pass


if __name__ == "__main__":
    main()
