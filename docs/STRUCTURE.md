# Repository structure

```
iNotes/
│
├── .github/
│   └── workflows/          # CI/CD (deploy backend, frontend)
│
├── backendset/             # Express API + MongoDB
│   ├── config/             # Env loading, AWS Secrets Manager, app config
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.js
│
├── client/                 # React SPA
│   ├── public/
│   └── src/
│
├── docs/                   # Documentation
│   ├── AWS_SECRETS.md
│   └── STRUCTURE.md
│
├── scripts/                # Dev & CI utilities
│   ├── generate-client-config.js
│   ├── ci-load-aws-secrets.js
│   ├── mongodb-ping.js
│   └── mongodb-example.js
│
├── k8s/                    # Kubernetes manifests (optional deploy path)
│
├── .env.example            # Template for root `.env` (copy to `.env`)
├── docker-compose.yml      # Local Docker stack
└── README.md
```

Secrets and URLs are configured in the **root** `.env` locally, or **AWS Secrets Manager** in production ([AWS_SECRETS.md](./AWS_SECRETS.md)).
