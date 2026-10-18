"""
Wire protocol for the distributed deadlock-detection demo.

Messages are newline-delimited JSON objects sent over a persistent TCP
connection between each pair of nodes. Every message is a plain dict with
a "type" field; see the README for the full message catalogue.

This module also owns the "global id" convention used everywhere else:
a process or resource is identified as "<node_id>.<local_name>", e.g.
"1.P1" or "2.R2", so that wait-for-graph edges remain unambiguous once
graphs from multiple nodes are merged together.
"""

from __future__ import annotations

import json
from typing import Any, Iterator


def global_id(node_id: int, local_name: str) -> str:
    """Build a globally-unique id like '1.P1' from a node id + local name."""
    return f"{node_id}.{local_name}"


def split_global_id(gid: str) -> tuple[int, str]:
    """Inverse of global_id(): '1.P1' -> (1, 'P1')."""
    node_part, _, local_part = gid.partition(".")
    return int(node_part), local_part


def encode(message: dict[str, Any]) -> bytes:
    """Encode a message dict as a single newline-terminated JSON line."""
    return (json.dumps(message, separators=(",", ":")) + "\n").encode("utf-8")


class LineBuffer:
    """
    Incrementally reassembles newline-delimited JSON messages from a stream
    of raw socket bytes, which may arrive split across multiple recv() calls
    or with multiple messages batched into one recv() call.
    """

    def __init__(self) -> None:
        self._buffer = b""

    def feed(self, chunk: bytes) -> Iterator[dict[str, Any]]:
        """Add newly-received bytes and yield any complete messages found."""
        self._buffer += chunk
        while b"\n" in self._buffer:
            line, self._buffer = self._buffer.split(b"\n", 1)
            if not line.strip():
                continue
            try:
                yield json.loads(line.decode("utf-8"))
            except json.JSONDecodeError:
                # Malformed line (shouldn't happen with a well-behaved peer) -
                # drop it rather than killing the connection.
                continue
