# Live demo script (two terminals)

Exact commands to type to reproduce the full story: election, a genuine
cross-node deadlock, detection + resolution, and a leader crash +
recovery. Everything you type is in `code blocks`; everything else is
what you should expect to see happen.

## 1. Start both nodes

**Terminal 1:**
```
python node.py --id 1 --port 5001 --peer 2:localhost:5002
```

**Terminal 2:**
```
python node.py --id 2 --port 5002 --peer 1:localhost:5001
```

Within a couple seconds both terminals print a Bully election happening
automatically. Node 2 (the higher id) wins:
```
[NODE 1] [BULLY] node 2 is the new leader
[NODE 2] [BULLY] no higher node responded - I am the new leader (node 2)
[NODE 2] [DEADLOCK] this node is now LEADER - starting deadlock detection loop
```

Type `leader` in either terminal any time to confirm who's in charge.

## 2. Each process grabs its own node's resource

**Terminal 1:**
```
acquire P1 R1
```
```
[NODE 1] [RESOURCES] 1.P1 granted 1.R1
```

**Terminal 2:**
```
acquire P2 R2
```
```
[NODE 2] [RESOURCES] 2.P2 granted 2.R2
```

## 3. Manufacture a genuine cross-node deadlock

Now each process asks for the *other* node's resource, which the other
process is already holding. This is the key moment: neither node's
local wait-for graph can show a cycle by itself - you need both edges
merged together.

**Terminal 1:**
```
request P1 2.R2
```
```
[NODE 1] [RESOURCES] 1.P1 must wait for 2.R2 (held by 2.P2, remote)
```

**Terminal 2:**
```
request P2 1.R1
```
```
[NODE 2] [RESOURCES] 2.P2 must wait for 1.R1 (held by 1.P1, remote)
```

Within a couple seconds (the leader's detection loop runs every 2s by
default), Node 2's terminal (the leader) prints:
```
[NODE 2] [DEADLOCK] DEADLOCK DETECTED: 2.P2 -> 1.P1 -> 2.P2 (cycle of 2 processes)
[NODE 2] [DEADLOCK] resolution policy: abort youngest waiter -> victim = 2.P2
[NODE 2] [RESOURCES] ABORTING 2.P2 (deadlock resolution (leader-local victim))
[NODE 2] [RESOURCES] released 2.R2
[NODE 2] [RESOURCES] 2.P2 aborted and rolled back - any resources it held are now free/reassigned
```
And Terminal 1 shows the knock-on effect - P1's original request finally
gets granted, and its now-pointless wait on Node 2's side gets cleaned up:
```
[NODE 1] [RESOURCES] 1.P1 granted 2.R2 (remote)
[NODE 1] [RESOURCES] removed 2.P2 from 1.R1's wait queue (aborted elsewhere)
```

Type `status` in either terminal to see the final state: Node 1's P1 now
holds both `1.R1` and `2.R2`, no wait-for edges remain anywhere, and
Node 2's `2.R2` entry shows `holder=1.P1`.

## 4. Kill the leader - watch Node 1 take over

Stop Node 2 with **Ctrl+C** (or close its terminal).

Within ~4 seconds, Terminal 1 shows:
```
[NODE 1] [NETWORK] lost connection to node 2
[NODE 1] [BULLY] no heartbeat from leader 2 in >3.5s - assuming it died
[NODE 1] [BULLY] starting election, challenging higher nodes [2]
[NODE 1] [BULLY] no higher node responded - I am the new leader (node 1)
[NODE 1] [DEADLOCK] this node is now LEADER - starting deadlock detection loop
```
The system keeps running - deadlock detection hasn't stopped, it just
moved to whoever is leader now.

## 5. Restart Node 2 - watch it reclaim leadership

**Terminal 2:**
```
python node.py --id 2 --port 5002 --peer 1:localhost:5001
```

Per Bully rules, the highest-id live node is always the rightful leader,
so Node 2 takes it back the moment it reconnects:
```
[NODE 2] [BULLY] no higher node responded - I am the new leader (node 2)
[NODE 1] [BULLY] node 2 is the new leader
[NODE 1] [DEADLOCK] this node is no longer leader - stopping deadlock detection loop
```

That's the whole story: election, genuine cross-node deadlock detection
and resolution, and crash + recovery, all over plain TCP sockets.
