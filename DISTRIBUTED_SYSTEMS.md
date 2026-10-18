# NutriLife as a Distributed System

NutriLife reads as a nutrition web app, but the way it's actually built and
deployed is a genuine, if modest, distributed system: several independent
processes, on different runtimes, that don't share memory and only know
about each other through the network, coordinating to serve one request.
This document explains the standard distributed-systems concepts that
apply here, and — for each one — points at exactly where in this
repository it's implemented, not just asserted.

If you're looking for a *hands-on, student-built* illustration of
leader election and deadlock detection specifically, see
[`distributed-deadlock-detection/`](distributed-deadlock-detection/README.md) —
a separate, self-contained two-node system built to make those two
mechanisms visible and operable. This document is about the main
NutriLife deployment itself.

---

## Architecture at a glance

```
                         ┌──────────────┐
                         │   Browser    │
                         └──────┬───────┘
                                │ HTTP
                                ▼
                 ┌──────────────────────────────┐
                 │   Kubernetes Service: app     │   ← load balancer
                 │        (type: LoadBalancer)   │
                 └──────────────┬────────────────┘
                                │ routes to whichever
                                │ pod is Ready
                 ┌──────────────▼────────────────┐
                 │   Pod: app (Next.js server)   │   ← stateless;
                 │   replicas: N (scalable)      │     can run >1 copy
                 └───────┬───────────────┬────────┘
                         │               │
        HTTP (REST)      │               │  mongodb+srv:// (TLS)
   "who holds this       │               │
    resource?"-style     ▼               ▼
   remote call   ┌───────────────┐   ┌─────────────────────────┐
                 │ K8s Service:  │   │     MongoDB Atlas        │
                 │  ml-service   │   │  (replica set, 3 nodes,  │
                 │  (ClusterIP)  │   │   leader-elected primary,│
                 └──────┬────────┘   │   cross-AZ replication)  │
                         │           └─────────────────────────┘
                 ┌───────▼────────┐
                 │ Pod: ml-service│
                 │  (FastAPI +    │          ┌─────────────────┐
                 │  scikit-learn) │          │   Groq AI API    │
                 └────────────────┘          │ (openai/gpt-oss) │
                         ▲                    └────────▲────────┘
                         │                             │
                         └── app also calls Groq over HTTP ──┘
```

Four independently-operated, independently-failing components: the app,
the ML service, MongoDB Atlas, and Groq's API. None of them share memory
or a process space. Everything between them is a network call, and the
system as a whole has to keep working even when one of those calls is
slow, fails, or the component serving it gets restarted mid-request.
That's the defining condition a *distributed system* is built to handle —
a single-process app simply doesn't have this class of problem.

---

## 1. Client-Server Model

**Theory.** The foundational distributed-systems pattern: a server exposes
a capability over a network behind a well-defined interface; one or more
clients invoke it without needing to know how it's implemented internally.
It generalizes recursively — a "server" to one caller can itself be a
"client" to another service.

**Here.** The browser is a client of the Next.js `app`. But the `app` is
*also* a client of two other servers: it calls `ml-service`'s `/predict`
endpoint and Groq's chat-completions endpoint, in both cases as a pure
network client with no special privileges. See `app/api/ai/generate-plan/route.ts`,
which plays server to the browser and client to two other servers in the
same function.

## 2. Microservices / Service Decomposition

**Theory.** Instead of one monolithic process containing all logic,
a system is split into independently deployable, independently scalable
services, each owning one bounded responsibility, talking to each other
over the network rather than through in-process function calls. The
payoff: services can be built in different languages, scaled
independently, deployed independently, and a bug in one can't corrupt
another's memory.

**Here.** `ml-service` does exactly one thing — load a trained
scikit-learn pipeline and classify a health profile — and nothing else.
It's written in Python because that's the right tool for serving a
scikit-learn model; the `app` is written in TypeScript/Node.js because
that's the right tool for the web UI and business logic. This is only
possible *because* they're decoupled services communicating over HTTP —
in a monolith you're stuck with one language for everything. See
`ml-service/main.py` (the entire service) versus `app/api/ai/generate-plan/route.ts`
(which calls it as a black box).

## 3. Network Communication & Partial Failure

**Theory.** In-process function calls either return or the whole process
crashes — there's no in-between. A *network* call has a third, much more
common outcome: it hangs, times out, or returns late, while the caller is
otherwise perfectly healthy. Distributed systems have to design for this
explicitly — this is the famous "partial failure" problem (one part of
the system fails while the rest keeps running, and the caller usually
can't immediately tell "failed" from "just slow").

**Here.** `generate-plan/route.ts` calls `ml-service` wrapped in an
`AbortController` with an explicit 4-second timeout, and on any failure —
timeout, connection refused, non-200 — it falls back to a default
`"Balanced"` diet category rather than failing the whole request:

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 4000);
const mlRes = await fetch(`${ML_SERVICE_URL}/predict`, { signal: controller.signal, ... });
```

That's not defensive-programming boilerplate — it's the direct,
necessary consequence of `ml-service` being a separate node that can be
mid-restart, overloaded, or network-partitioned from `app` at any moment,
something that's structurally impossible to happen to a plain function
call.

## 4. Service Discovery

**Theory.** Components in a distributed system can't hardcode each
other's IP addresses, because those addresses change — a process
restarts on a different host, a container gets rescheduled, a replica is
added or removed. Systems solve this with a discovery mechanism: DNS, a
registry (Consul, etcd, Eureka), or a platform-provided equivalent.

**Here.** Kubernetes provides this natively. `app` never knows
`ml-service`'s pod IP — it's configured (`k8s/configmap.yaml`) with the
*logical* address `http://ml-service:8000`, and Kubernetes' internal
DNS (CoreDNS) resolves that name to whichever pod currently matches the
`ml-service` Service's label selector, live, every time. Delete and
recreate the `ml-service` pod — it gets a new IP — and `app` needs zero
changes; the name still resolves correctly. The Docker Compose setup
(`docker-compose.yml`) uses the equivalent mechanism at a smaller scale:
Docker's embedded DNS resolving the service name `ml-service` on the
compose network.

MongoDB Atlas uses the same idea one layer up: the `mongodb+srv://`
connection string in `.env` isn't a fixed address either — it's a DNS SRV
record that the driver resolves to find the replica set's *current*
members, which can change as Atlas performs maintenance or failover.

## 5. Load Balancing

**Theory.** Spreading incoming requests across multiple instances of a
service, so no single instance becomes a bottleneck or a single point of
failure, and so capacity can be added by adding more instances rather
than making one instance bigger.

**Here.** A Kubernetes `Service` *is* a load balancer — even running one
replica today, `k8s/app.yaml`'s `app` Service and `k8s/ml-service.yaml`'s
`ml-service` Service both distribute requests across every pod matching
their selector. Raising `replicas: 1` to `replicas: 3` in either
Deployment spec is the entire change needed to go from one instance to
three load-balanced instances — no code changes, because the app was
never talking to a specific pod in the first place, only to the Service's
stable name.

## 6. Statelessness & Horizontal Scalability

**Theory.** This is *why* load balancing above works at all. If a server
keeps client-specific state in its own memory (e.g. "this session belongs
to connection #4"), you can't freely route a client's next request to a
*different* instance — you need sticky sessions, which reintroduces a
single point of failure and complicates scaling. The standard fix: keep
the server itself stateless, and push all state into an external,
shared store that every instance can reach equally.

**Here.** `app` holds no session state in memory. Authentication state
lives in a signed JWT cookie (`lib/auth/authOptions.ts`) that *any* pod
can verify independently — there's nothing a specific pod "remembers"
about a logged-in user. All persistent data lives in MongoDB Atlas, not
in process memory. This is precisely what makes raising `replicas`
safe: a user's second request can land on a completely different pod
than their first, and nothing breaks.

## 7. Fault Tolerance & Self-Healing

**Theory.** A distributed system has to assume components will fail —
crash, hang, get killed, lose network connectivity — and keep working
anyway. Core patterns: health checks (so the system can tell "alive" from
"actually working"), automatic restart of failed components, and
timeouts/circuit breakers so a caller doesn't wait forever on a dead
dependency.

**Here, at two layers:**
- **Platform layer.** Both `k8s/app.yaml` and `k8s/ml-service.yaml`
  define `readinessProbe` and `livenessProbe` (`GET /`). If a pod fails
  its liveness probe, `kubelet` kills and restarts the container
  automatically — no human or external monitoring needed. If it fails
  *readiness*, the Service stops routing traffic to it immediately, so a
  struggling pod doesn't silently serve errors to users while it
  recovers. `docker-compose.yml` has the same healthchecks plus
  `restart: unless-stopped`.
- **Application layer.** The 4-second timeout + fallback in
  `generate-plan/route.ts` (§3) is the application defending itself
  against its *own* dependency failing — a concern that only exists
  because `ml-service` is a separate, independently-failing node.

## 8. Rolling (Zero-Downtime) Deployment

**Theory.** Because instances are stateless and sit behind a load
balancer, you can deploy a new version by bringing up new instances
*alongside* the old ones, waiting for each new instance to prove it's
healthy, then retiring an old one — repeating until all instances are
updated, with the service never going fully offline. This only works
because of §5 and §6 above; a monolith with in-memory state can't do this
safely.

**Here, actually exercised in this project's history:** `kubectl rollout
restart deployment/app` was run against this exact deployment — Kubernetes
started a brand-new pod, waited for it to pass its readiness probe, *then*
terminated the old pod, and the Service never stopped answering requests
in between. Verified directly, not theoretical:
```
Waiting for deployment "app" rollout to finish: 1 old replicas are pending termination...
deployment "app" successfully rolled out
```

## 9. Distributed Data Storage & Consensus

**Theory.** A production database usually isn't one server either — it's
a cluster of multiple nodes replicating data for durability and
availability, using a consensus protocol to agree on which node is
authoritative for writes (the *primary*/*leader*) at any given moment,
and to detect and recover from that node failing. This is where
distributed systems theory meets the CAP theorem: a system can't
simultaneously guarantee full Consistency and full Availability during a
network Partition, so real systems pick a default and make it tunable.

**Here.** MongoDB Atlas runs as a **replica set** (multiple nodes across
availability zones). It elects a primary via a Raft-like consensus
protocol, replicates every write to secondaries, and — if the primary
fails — automatically holds a new election and promotes a secondary,
transparently to `app`. By default, Atlas/MongoDB favors consistency on
the primary (all acknowledged writes are durable before being
acknowledged, configurable via *write concern*, e.g. `w=majority` in this
project's connection string), while read preference can be tuned toward
availability (reading from secondaries, accepting slightly stale/eventually-
consistent data) if desired. The app never has to implement any of this —
it just talks to the logical address and the driver + Atlas handle
discovery and failover underneath (§4).

**Direct tie-in:** the leader-election mechanism Atlas performs for you,
invisibly, is the *exact same concept* implemented by hand, visibly, in
[`distributed-deadlock-detection/bully.py`](distributed-deadlock-detection/bully.py) —
that project exists specifically so you can watch an election happen,
trigger a leader's "crash," and see a new one get chosen, instead of
trusting it as a black box the way `app` trusts Atlas.

## 10. Distributed-Systems-Motivated Authentication

**Theory.** Centralized session storage (a shared in-memory or single-DB
session table every request must check) reintroduces exactly the
bottleneck/single-point-of-failure problem statelessness is meant to
avoid. The standard distributed-systems-friendly pattern is a short-lived,
self-contained, cryptographically signed **access token**: any node can
verify it instantly, offline, with no network call — it just checks the
signature. Because a short-lived token alone can't be revoked early, it's
paired with a longer-lived, database-backed **refresh token** that *can*
be revoked, rotated, and checked against a real data store, but only
rarely (once per token lifetime) rather than on every single request.

**Here.** `lib/auth/authOptions.ts` implements exactly this: a 15-minute
access-token window embedded in the session JWT (verified by whichever
pod gets the request, no DB hit), backed by a 7-day, DB-stored, rotating
refresh token (`lib/models/RefreshToken.ts`) that's checked and rotated
only when the access token expires. This is the same statelessness
principle from §6, applied specifically to auth: it's what lets *any* pod
authenticate *any* request without a shared session store.

---

## Summary

| Concept | Theory in one line | Where it's implemented here |
|---|---|---|
| Client-server | A server exposes a capability over the network to clients | `app` serves the browser *and* is a client of `ml-service`/Groq — `app/api/ai/generate-plan/route.ts` |
| Microservices | Independently deployable services, each with one responsibility | `ml-service/` (Python/FastAPI) vs the Next.js `app` — different runtimes, one HTTP contract |
| Partial failure handling | A network call can hang/fail independently of the caller | `AbortController` + 4s timeout + fallback in `generate-plan/route.ts` |
| Service discovery | Components find each other by logical name, not fixed IP | K8s DNS (`http://ml-service:8000`, `k8s/configmap.yaml`); Atlas's `mongodb+srv://` SRV record |
| Load balancing | Spread requests across instances | K8s `Service` objects — `k8s/app.yaml`, `k8s/ml-service.yaml` |
| Statelessness | No per-client state in server memory, enabling scaling | JWT sessions (`lib/auth/authOptions.ts`), all data in Atlas |
| Fault tolerance | Detect and recover from component failure automatically | Readiness/liveness probes, `kubectl` auto-restart, app-level timeouts |
| Rolling deployment | Update live instances without downtime | `kubectl rollout restart deployment/app` — verified working |
| Distributed consensus / replication | Multiple nodes agree on a leader and replicate data | MongoDB Atlas replica set; hand-built illustration in `distributed-deadlock-detection/bully.py` |
| Token-based distributed auth | Verify identity without a centralized session store | Access/refresh token pair — `lib/auth/authOptions.ts`, `lib/models/RefreshToken.ts` |

None of this requires treating NutriLife as two separate projects bolted
together — it's one deployment where every property above is a direct,
necessary consequence of the same decision: splitting a web app, an ML
service, and a database across independent, network-connected processes
instead of running everything in one.
