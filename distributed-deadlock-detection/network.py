"""
TCP networking layer between nodes.

Connection-establishment rule (keeps this simple for N nodes, demoed with 2):
the node with the LOWER numeric id actively dials out to peers with a HIGHER
id; the higher-id node just listens and accepts. This avoids ever opening a
duplicate/competing connection between the same pair of nodes.

Each socket's first message is always a HELLO carrying the sender's node id,
so the receiving side knows which peer a freshly-accepted connection belongs
to before registering it.

A background "dialer" thread per higher-id peer retries the connection with
backoff whenever it's down, which is what lets a restarted node rejoin the
cluster automatically (important for the Bully-recovery part of the demo).
"""

from __future__ import annotations

import logging
import socket
import threading
import time
from typing import Callable

from protocol import LineBuffer, encode

log = logging.getLogger("network")

MessageHandler = Callable[[int, dict], None]


class NetworkManager:
    def __init__(self, node_id: int, port: int, peers: dict[int, tuple[str, int]]):
        """
        node_id: this node's id
        port:    port this node listens on
        peers:   {peer_id: (host, port)} for every other known node
        """
        self.node_id = node_id
        self.port = port
        self.peers = peers

        self._sockets: dict[int, socket.socket] = {}
        self._lock = threading.Lock()
        self._on_message: MessageHandler | None = None
        self._on_peer_up: Callable[[int], None] | None = None
        self._on_peer_down: Callable[[int], None] | None = None
        self._stop = threading.Event()

    # ------------------------------------------------------------------
    # Wiring callbacks from the node's higher-level logic
    # ------------------------------------------------------------------
    def set_handlers(
        self,
        on_message: MessageHandler,
        on_peer_up: Callable[[int], None] | None = None,
        on_peer_down: Callable[[int], None] | None = None,
    ) -> None:
        self._on_message = on_message
        self._on_peer_up = on_peer_up
        self._on_peer_down = on_peer_down

    # ------------------------------------------------------------------
    # Startup
    # ------------------------------------------------------------------
    def start(self) -> None:
        threading.Thread(target=self._accept_loop, daemon=True).start()
        for peer_id, (host, port) in self.peers.items():
            if peer_id > self.node_id:
                threading.Thread(
                    target=self._dial_loop, args=(peer_id, host, port), daemon=True
                ).start()

    def stop(self) -> None:
        self._stop.set()
        with self._lock:
            for s in self._sockets.values():
                try:
                    s.close()
                except OSError:
                    pass

    # ------------------------------------------------------------------
    # Listener side (accepts connections from lower-id... wait, HIGHER id
    # peers dial OUT, so we accept connections FROM lower-id peers)
    # ------------------------------------------------------------------
    def _accept_loop(self) -> None:
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("0.0.0.0", self.port))
        server.listen(8)
        log.info("listening on port %d", self.port)
        while not self._stop.is_set():
            try:
                conn, addr = server.accept()
            except OSError:
                break
            threading.Thread(
                target=self._handle_incoming, args=(conn,), daemon=True
            ).start()

    def _handle_incoming(self, conn: socket.socket) -> None:
        buf = LineBuffer()
        peer_id: int | None = None
        try:
            while True:
                chunk = conn.recv(4096)
                if not chunk:
                    break
                for message in buf.feed(chunk):
                    if peer_id is None:
                        if message.get("type") != "HELLO":
                            continue
                        peer_id = int(message["from"])
                        self._register(peer_id, conn)
                        continue
                    self._dispatch(peer_id, message)
        except OSError:
            pass
        finally:
            if peer_id is not None:
                self._unregister(peer_id, conn)

    # ------------------------------------------------------------------
    # Dialer side (we have the lower id; connect out to higher-id peers)
    # ------------------------------------------------------------------
    def _dial_loop(self, peer_id: int, host: str, port: int) -> None:
        backoff = 0.5
        while not self._stop.is_set():
            try:
                conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                conn.connect((host, port))
                conn.sendall(encode({"type": "HELLO", "from": self.node_id}))
                self._register(peer_id, conn)
                backoff = 0.5
                self._read_until_closed(peer_id, conn)
            except OSError:
                pass
            self._unregister(peer_id, None)
            time.sleep(backoff)
            backoff = min(backoff * 1.7, 5.0)

    def _read_until_closed(self, peer_id: int, conn: socket.socket) -> None:
        buf = LineBuffer()
        while not self._stop.is_set():
            chunk = conn.recv(4096)
            if not chunk:
                return
            for message in buf.feed(chunk):
                self._dispatch(peer_id, message)

    # ------------------------------------------------------------------
    # Bookkeeping + dispatch
    # ------------------------------------------------------------------
    def _register(self, peer_id: int, conn: socket.socket) -> None:
        with self._lock:
            self._sockets[peer_id] = conn
        log.info("connected to node %d", peer_id)
        if self._on_peer_up:
            self._on_peer_up(peer_id)

    def _unregister(self, peer_id: int, conn: socket.socket | None) -> None:
        removed = False
        with self._lock:
            current = self._sockets.get(peer_id)
            if current is not None and (conn is None or current is conn):
                del self._sockets[peer_id]
                removed = True
                try:
                    current.close()
                except OSError:
                    pass
        if not removed:
            return  # nothing was actually connected - just a failed (re)connect attempt
        log.warning("lost connection to node %d", peer_id)
        if self._on_peer_down:
            self._on_peer_down(peer_id)

    def _dispatch(self, peer_id: int, message: dict) -> None:
        if self._on_message:
            self._on_message(peer_id, message)

    # ------------------------------------------------------------------
    # Sending
    # ------------------------------------------------------------------
    def send(self, peer_id: int, message: dict) -> bool:
        with self._lock:
            conn = self._sockets.get(peer_id)
        if conn is None:
            return False
        try:
            conn.sendall(encode(message))
            return True
        except OSError:
            self._unregister(peer_id, conn)
            return False

    def broadcast(self, message: dict) -> None:
        with self._lock:
            peer_ids = list(self._sockets.keys())
        for peer_id in peer_ids:
            self.send(peer_id, message)

    def connected_peers(self) -> list[int]:
        with self._lock:
            return list(self._sockets.keys())
