# Running NutriLife on Kubernetes

Plain Kubernetes manifests (no Helm) for the same two services that
`docker-compose.yml` runs: the Next.js `app` and the FastAPI `ml-service`.
MongoDB is Atlas (cloud), not deployed into the cluster — both services
reach it the same way the Docker setup does, via `MONGODB_URI`.

## Prerequisites

- A Kubernetes cluster and `kubectl` pointed at it. For local development,
  Docker Desktop's built-in Kubernetes (Settings → Kubernetes → Enable) is
  the easiest - it shares the same local image store Docker already uses,
  so no image registry/push step is needed. `minikube`/`kind` work too but
  need an extra step to load the images (see below).
- The two images already built locally:
  ```bash
  docker build -t nutrilife-atharva-app:latest .
  docker build -t nutrilife-atharva-ml-service:latest ./ml-service
  ```
  (These are exactly the image names/tags the manifests reference. If you
  built them via `docker compose build`, the names already match, since
  Compose names images `<project>-<service>`.)
- A `.env` file in the project root with your real `MONGODB_URI`,
  `NEXTAUTH_SECRET`, and `GROQ_API_KEY` (same file Docker Compose uses).

## Deploy

```bash
# 1. Create the namespace + the real secret (reads straight from .env,
#    never written to a committed file)
kubectl create namespace nutrilife --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic nutrilife-secrets \
  --namespace nutrilife \
  --from-literal=NEXTAUTH_SECRET="$(grep ^NEXTAUTH_SECRET .env | cut -d= -f2-)" \
  --from-literal=MONGODB_URI="$(grep ^MONGODB_URI .env | cut -d= -f2-)" \
  --from-literal=GROQ_API_KEY="$(grep ^GROQ_API_KEY .env | cut -d= -f2-)"

# 2. Apply everything else
kubectl apply -k k8s/
```

That's it - `kustomization.yaml` applies the namespace, ConfigMap, and both
services' Deployments + Services together.

## Check it's up

```bash
kubectl get pods -n nutrilife
kubectl get svc -n nutrilife
```

Both pods should reach `Running` / `1/1 Ready` once their readiness probes
pass (the ml-service pod takes longer to go `Running` than to go `Ready`,
since the model is already baked into the image - no training delay here).

On Docker Desktop's Kubernetes, the `app` Service (`type: LoadBalancer`)
is automatically reachable at **http://localhost:3000** - same URL as the
Docker Compose setup. On `minikube`, use `minikube service app -n nutrilife`
instead; on a cluster with no load balancer support, switch `app.yaml`'s
Service to `type: NodePort` or front it with an Ingress.

## minikube / kind: loading local images

These don't share Docker Desktop's image store, so after building the
images you need to load them into the cluster's own image store before
`kubectl apply`:

```bash
# minikube
minikube image load nutrilife-atharva-app:latest
minikube image load nutrilife-atharva-ml-service:latest

# kind
kind load docker-image nutrilife-atharva-app:latest
kind load docker-image nutrilife-atharva-ml-service:latest
```

## Updating after a code change

Kubernetes won't notice a rebuilt `:latest` image on its own (same tag =
no change detected). After `docker build`-ing a new image, force a
redeploy with:
```bash
kubectl rollout restart deployment/app -n nutrilife
kubectl rollout restart deployment/ml-service -n nutrilife
```

## Tear down

```bash
kubectl delete -k k8s/
kubectl delete secret nutrilife-secrets -n nutrilife
kubectl delete namespace nutrilife
```

## Design notes

- **No `depends_on` equivalent.** Compose can wait for ml-service to be
  healthy before starting the app; Kubernetes has no native "wait for
  another Deployment" concept. This is fine here because the app already
  tolerates the ML service being briefly unreachable (a 4s timeout and a
  "Balanced" fallback, in `app/api/ai/generate-plan/route.ts`) - the same
  resilience that protects it from a slow/restarting pod protects it from
  startup ordering too.
- **Single replica by default.** The app is stateless (all state lives in
  Atlas), so `replicas` can be raised safely if you want to test scaling -
  there's no in-memory session state tying a user to a specific pod.
- **`imagePullPolicy: Never`** assumes local images on Docker Desktop's
  Kubernetes. Deploying to a real cluster means pushing these images to a
  registry (Docker Hub, GHCR, ECR, ...) and changing this to
  `IfNotPresent` or `Always` with the registry-qualified image name.
