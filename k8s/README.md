# Kubernetes deployment

Optional manifests for running iNotes on Kubernetes (EKS, etc.).

## Prerequisites

- Cluster with an ingress controller (e.g. AWS Load Balancer Controller)
- MongoDB Atlas (or in-cluster MongoDB)
- Secrets from [AWS Secrets Manager](../docs/AWS_SECRETS.md) synced via [External Secrets Operator](https://external-secrets.io/) or mounted as a Kubernetes `Secret`

## Apply

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Create secret (example — prefer External Secrets in production)
kubectl create secret generic inotes-secrets \
  --from-env-file=../.env \
  -n inotes \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Deploy API and services
kubectl apply -f api-deployment.yaml
kubectl apply -f api-service.yaml

# 4. Ingress (edit hostnames first)
kubectl apply -f ingress.yaml
```

## Files

| File | Purpose |
|------|---------|
| `namespace.yaml` | `inotes` namespace |
| `api-deployment.yaml` | Backend API pods |
| `api-service.yaml` | ClusterIP for API |
| `ingress.yaml` | Routes traffic to API (extend for static client/CDN) |

The React client is typically deployed to **S3 + CloudFront** (see `.github/workflows/deploy-frontend.yml`). For in-cluster static hosting, build the client image from `client/Dockerfile` and add a deployment here.
