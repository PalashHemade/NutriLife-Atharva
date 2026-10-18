"""
Bully leader-election algorithm.

Standard textbook version:
  - A node starts an election by sending ELECTION to every peer with a
    HIGHER id.
      - If nobody with a higher id answers OK within a timeout, it declares
        itself the leader and broadcasts COORDINATOR to everyone.
      - If a higher node answers OK, this node backs off and waits to be
        told who the new coordinator is.
  - A node that receives an ELECTION message always replies OK to the
    sender (because the sender has a lower id) and then starts its own
    election if it isn't already running one or already the leader -
    this is what lets the highest-id live node always end up as leader.
  - The leader sends periodic HEARTBEATs. A follower that stops hearing
    from the leader for too long assumes it crashed and starts a new
    election itself.

This class only deals with election *state*; actually sending bytes is
delegated to the callbacks passed in from node.py (so this file has no
direct socket code, which keeps it easy to read/grade on its own).
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Callable

log = logging.getLogger("bully")


class BullyElection:
    def __init__(
        self,
        node_id: int,
        peer_ids: list[int],
        send: Callable[[int, dict], bool],
        broadcast: Callable[[dict], None],
        on_become_leader: Callable[[], None],
        on_lose_leadership: Callable[[], None],
        election_timeout: float = 2.0,
        heartbeat_interval: float = 1.0,
        heartbeat_timeout: float = 3.5,
    ) -> None:
        self.node_id = node_id
        self.peer_ids = peer_ids
        self._send = send
        self._broadcast = broadcast
        self._on_become_leader = on_become_leader
        self._on_lose_leadership = on_lose_leadership
        self.election_timeout = election_timeout
        self.heartbeat_interval = heartbeat_interval
        self.heartbeat_timeout = heartbeat_timeout

        self._lock = threading.RLock()
        self.leader_id: int | None = None
        self._election_in_progress = False
        self._higher_peer_responded = False
        self._last_heartbeat = time.time()
        self._stop = threading.Event()

        # Each call to start_election() that actually proceeds (i.e. isn't
        # suppressed by _election_in_progress) gets its own round id, and
        # its deferred timeout callback carries that id. This is what lets
        # _on_election_timeout tell "this specific round was resolved by a
        # COORDINATOR while the timer was in flight" apart from "leader_id
        # happens to hold a stale value left over from a much earlier,
        # unrelated round" - using leader_id itself for that check was an
        # earlier bug here: it also silently blocked *every* future
        # election after the first one ever completed.
        self._round_id = 0
        self._round_resolved_by_coordinator = False

    @property
    def is_leader(self) -> bool:
        with self._lock:
            return self.leader_id == self.node_id

    # ------------------------------------------------------------------
    # Background loops
    # ------------------------------------------------------------------
    def start(self) -> None:
        threading.Thread(target=self._heartbeat_loop, daemon=True).start()
        threading.Thread(target=self._watchdog_loop, daemon=True).start()

    def stop(self) -> None:
        self._stop.set()

    def _heartbeat_loop(self) -> None:
        while not self._stop.is_set():
            if self.is_leader:
                self._broadcast({"type": "HEARTBEAT", "from": self.node_id})
            time.sleep(self.heartbeat_interval)

    def _watchdog_loop(self) -> None:
        while not self._stop.is_set():
            time.sleep(0.5)
            with self._lock:
                leader = self.leader_id
                stale = (time.time() - self._last_heartbeat) > self.heartbeat_timeout
                already_electing = self._election_in_progress
            if leader is not None and leader != self.node_id and stale and not already_electing:
                log.warning(
                    "no heartbeat from leader %d in >%.1fs - assuming it died",
                    leader,
                    self.heartbeat_timeout,
                )
                self.start_election()

    # ------------------------------------------------------------------
    # Election protocol
    # ------------------------------------------------------------------
    def start_election(self) -> None:
        with self._lock:
            if self._election_in_progress:
                return
            self._election_in_progress = True
            self._higher_peer_responded = False
            self._round_resolved_by_coordinator = False
            self._round_id += 1
            my_round = self._round_id
            higher_peers = [p for p in self.peer_ids if p > self.node_id]

        if not higher_peers:
            self._declare_victory()
            return

        log.info("starting election, challenging higher nodes %s", higher_peers)
        for peer in higher_peers:
            self._send(peer, {"type": "ELECTION", "from": self.node_id})

        threading.Timer(self.election_timeout, self._on_election_timeout, args=(my_round,)).start()

    def _on_election_timeout(self, my_round: int) -> None:
        with self._lock:
            stale_round = my_round != self._round_id
            responded = self._higher_peer_responded
            resolved = self._round_resolved_by_coordinator
            if not stale_round:
                self._election_in_progress = False
        if not responded and not resolved and not stale_round:
            self._declare_victory()
        # else: either a higher node answered OK, a COORDINATOR already
        # settled this exact round, or a newer round has superseded it -
        # in every case we just wait for/keep the real outcome.

    def _declare_victory(self) -> None:
        with self._lock:
            self.leader_id = self.node_id
            self._election_in_progress = False
            self._last_heartbeat = time.time()
        log.info("no higher node responded - I am the new leader (node %d)", self.node_id)
        self._broadcast({"type": "COORDINATOR", "from": self.node_id})
        self._on_become_leader()

    # ------------------------------------------------------------------
    # Incoming message handlers (called from node.py's dispatcher)
    # ------------------------------------------------------------------
    def on_election(self, from_id: int) -> None:
        # Reply OK (the sender has a lower id than us, or it wouldn't have
        # challenged us), then run our own election to settle the matter
        # properly. We deliberately do NOT guess the outcome here: if we
        # have no higher peers, start_election() resolves synchronously
        # and simply re-confirms us as leader (a harmless no-op - leader
        # stays set, detection loop keeps running). If a genuinely higher
        # peer exists, start_election() waits for it exactly like any
        # other election, and on_coordinator() already handles telling
        # deadlock.py to stop if that peer wins instead of us. Pre-emptively
        # clearing leader_id/firing on_lose_leadership here (an earlier
        # version of this method did) was wrong: it fired even when this
        # exact call re-confirmed our own leadership, spuriously stopping
        # our detection loop while we were never not the leader.
        log.info("received ELECTION from lower node %d - replying OK", from_id)
        self._send(from_id, {"type": "OK", "from": self.node_id})
        self.start_election()

    def on_ok(self, from_id: int) -> None:
        log.info("received OK from higher node %d - standing down this round", from_id)
        with self._lock:
            self._higher_peer_responded = True

    def on_coordinator(self, from_id: int) -> None:
        with self._lock:
            was_leader = self.leader_id == self.node_id
            self.leader_id = from_id
            self._election_in_progress = False
            self._round_resolved_by_coordinator = True
            self._last_heartbeat = time.time()
        log.info("node %d is the new leader", from_id)
        if was_leader and from_id != self.node_id:
            self._on_lose_leadership()

    def on_heartbeat(self, from_id: int) -> None:
        # A heartbeat only counts as legitimate proof of leadership if it
        # came from a node whose id is at least as high as ours - under
        # Bully rules a lower-id node can never rightfully be leader while
        # we're alive. Blindly trusting any heartbeat would let a stale or
        # incorrect self-declared "leader" silently hijack a follower's
        # belief without ever going through a real election. If a lower
        # node claims it, challenge it with our own election instead.
        with self._lock:
            if from_id < self.node_id:
                challenge = True
            else:
                self.leader_id = from_id
                self._last_heartbeat = time.time()
                challenge = False
        if challenge:
            log.warning("ignoring HEARTBEAT from lower node %d claiming leadership - challenging it", from_id)
            self.start_election()
