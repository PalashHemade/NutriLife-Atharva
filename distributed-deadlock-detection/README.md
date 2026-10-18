# Distributed Deadlock Detection (Wait-For Graph + Bully Election)

A small distributed system of **two independent nodes** that demonstrates
three classic distributed-systems techniques working together, not as
three separate toy scripts, but as one system where each piece exists
because the others need it:

1. **Deadlock detection** across processes, using a wait-for graph (WFG)
   and cycle detection.
2. **Leader election** between the nodes, using the **Bully algorithm**.
3. **Client-server messaging between distributed nodes**, using raw TCP
   sockets with a small JSON protocol.

Pure Python 3 standard library only (`socket`, `threading`, `json`,
`argparse`) - nothing to `pip install`.

## Why these three things need each other

Each node simulates its own local processes and resources, and can only
see its *own* local wait-for edges. A real distributed deadlock can be
completely invisible to every individual node and only show up once you
merge several nodes' graphs together - e.g. a process on Node A is
waiting on a process on Node B, and vice versa. Neither node alone can
see that cycle.

Someone has to own the job of merging the graphs and running cycle
detection. **That's what the Bully-elected leader does.** If the leader
crashes, a follower notices (missed heartbeats), triggers a new
election, and deadlock detection keeps running under the new leader.
Sockets are how nodes hold the election, forward resource requests that
cross node boundaries, and report each node's local wait-for edges to
whoever is currently leader.

## Architecture

```
                    TCP (JSON lines)
   ┌─────────────┐  <──────────────>  ┌─────────────┐
   │   Node 1    │                    │   Node 2    │
   │  port 5001  │                    │  port 5002  │
   │             │                    │             │
   │  owns  R1   │                    │  owns  R2   │
   │  procs P1.. │                    │  procs P2.. │
   └─────────────┘                    └─────────────┘
```

Each node maintains:
- A small set of **resources** it owns (by default one, `R<node_id>`),
  each either free or held by a process - local or remote.
- Local **processes** (`P1`, `P2`, ...), driven by a CLI you type
  commands into, that can acquire/release/wait-for resources.
- A **local wait-for graph**: an edge `Pi -> Pj` means "Pi is blocked,
  waiting for a resource currently held by Pj". Processes/resources are
  addressed globally as `<node_id>.<name>` (e.g. `1.P1`, `2.R2`) so
  cross-node edges are unambiguous once graphs get merged.

**Cross-node resource access**: if a process asks for a resource owned
by the other node, the request is forwarded over a socket to the owning
node, which replies `GRANTED` or `WAIT(holder=...)`. On `WAIT`, the
*requesting* node records the edge locally, because it now knows who the
remote holder is - this is what lets a purely local graph end up
containing a cross-node edge, reported up to the leader.

**Bully leader election**: on startup, or when a follower's
leader-heartbeat watchdog times out, a node sends `ELECTION` to every
peer with a *higher* id. If none reply `OK`, it declares itself leader
and broadcasts `COORDINATOR`. If a higher peer replies `OK`, it backs
off and waits to be told the outcome. The leader sends periodic
`HEARTBEAT`s. A node that receives a heartbeat from a *lower*-id node
never just trusts it (that would violate Bully's core invariant) - it
challenges with its own election instead.

**Leader-coordinated deadlock detection**: every follower periodically
sends its local wait-for edges to whoever it currently believes is
leader. The leader merges everyone's edges (plus its own) into one
graph and runs DFS cycle detection on a timer. On finding a cycle, it
picks a victim - the process whose wait began most recently among the
cycle members (abort the newcomer, a standard database heuristic) - and
sends that process's owning node an `ABORT`. The owning node releases
everything that process held, cancels its pending wait (even if that
wait was on the *other* node's resource queue), and the leader re-checks.

## Files

| File | Purpose |
|---|---|
| `node.py` | Entry point - wires everything together, runs the interactive CLI |
| `network.py` | TCP connection handling (listen/dial/reconnect, message framing) |
| `protocol.py` | Message encode/decode + the `<node>.<name>` global-id convention |
| `bully.py` | Bully election state machine (election/heartbeat/timeout handling) |
| `resource_manager.py` | Local resource/process bookkeeping, local wait-for edges |
| `deadlock.py` | Leader-only: merges graphs, DFS cycle detection, victim selection |
| `SCENARIO.md` | Step-by-step two-terminal walkthrough, for a live demo |
| `demo_runner.py` | Runs the entire scenario automatically in one command |

## Running it

**Interactive (two terminals, for a live demo):**
```
# terminal 1
python node.py --id 1 --port 5001 --peer 2:localhost:5002

# terminal 2
python node.py --id 2 --port 5002 --peer 1:localhost:5001
```
Then follow [`SCENARIO.md`](SCENARIO.md).

**Automated (one command, proves the whole thing end-to-end):**
```
python demo_runner.py
```
This starts both nodes itself, drives the full scenario (election,
cross-node deadlock, detection, resolution, leader crash, leader
recovery), and prints every node's log output, tagged by node.

## CLI commands (typed into a running node)

```
acquire <P> <R>   process P requests resource R
                  ("acquire P1 R1" for your own resource,
                   "acquire P1 2.R2" for another node's)
request <P> <R>   alias for acquire (matches wait-for-graph wording)
release <P> <R>   process P releases resource R
status            this node's resources, holders, queues, wait-edges
leader            who this node currently believes is leader
peers             which peers we have a live connection to
```

## Design notes / known simplifications

- Each process has at most one outstanding wait at a time (issuing a
  second `request` while already waiting replaces the first wait-edge).
  This matches the standard textbook wait-for-graph assumption and keeps
  the demo easy to reason about.
- Connection rule: the lower-id node dials out, the higher-id node
  listens - this avoids ever opening a duplicate connection between the
  same pair of nodes, and generalizes cleanly beyond 2 nodes even though
  the demo targets exactly 2.
- If you start the lower-id node well before the higher-id one, the
  lower-id node will briefly elect itself (it tried to reach the higher
  node and got nothing within the timeout) and then hand leadership over
  the moment the higher node boots and runs its own startup election.
  That's expected Bully behaviour, not a bug.
- This is a teaching/demo implementation, not a production consensus
  system: there's no persistence, no Byzantine-fault handling, and
  message delivery is "best effort" TCP (no retries for in-flight
  application messages, though the *connections* themselves do
  reconnect automatically).
