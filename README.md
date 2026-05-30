# iNotes

iNotes is a Notion-inspired notes and knowledge workspace app. It includes authentication, workspace management, page hierarchy, rich-text editing, favorites, trash/restore, and search.

## Current Product Scope

- User signup, login, logout, and profile update
- JWT access token + refresh token flow
- Multiple workspaces per user
- Pages and nested sub-pages
- Rich editor content per page
- Starred pages, trash, restore, and permanent delete
- Workspace/page search

## Project Structure

```
iNotes/
├── .github/workflows/   # CI/CD
├── backendset/          # Express + MongoDB API
├── client/              # React SPA
├── docs/                # Documentation
├── scripts/             # Utilities (config gen, MongoDB checks)
├── k8s/                 # Kubernetes manifests
├── .env.example
├── docker-compose.yml
└── README.md
```

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for details.

## Tech Stack

- Frontend: React, React Router, TipTap editor
- Backend: Node.js, Express, Mongoose, JWT, Express Validator
- Database: MongoDB Atlas
- Security/ops middleware: helmet, cors, cookie-parser, morgan, rate limiting

## Local Development Setup

### 1) Install dependencies

```bash
cd backendset && npm install
cd ../client && npm install
```

### 2) Configure environment (single root `.env`)

All variables for the API and React app live in one file at the **repository root**:

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and API URL
```

| Variable | Used by |
|----------|---------|
| `MONGO_URL` | Backend API, `scripts/mongodb-ping.js` |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Backend auth |
| `PORT`, `NODE_ENV`, `CLIENT_URL` | Backend server / CORS |
| `API_URL` | Public backend URL (same as API in most setups) |
| `REACT_APP_API_URL` | React build + `client/public/config.js` |
| `AWS_SECRETS_MANAGER_SECRET_ID` | Production: JSON secret in AWS (see [docs/AWS_SECRETS.md](docs/AWS_SECRETS.md)) |

Notes:
- Do not add spaces around `=`.
- URL-encode special characters in MongoDB password.
- Never commit `.env` (only `.env.example`).

### 3) Run backend

```bash
cd backendset
npm start
```

Expected logs:
- `iNotes API server running at http://localhost:5500`
- `Connected to MongoDB`

### 4) Run frontend

```bash
cd client
npm start
```

App URL: `http://localhost:3000`

## API Overview

Mounted base routes:
- `/api/auth`
- `/api/notes` (legacy notes endpoints)
- `/api/workspaces`
- `/api/pages`
- `/health`

## Production and AWS Direction

Target deployment for production:
- Frontend: S3 + CloudFront
- Backend API: ECS Fargate (or Elastic Beanstalk/App Runner)
- Database: MongoDB Atlas
- Secrets: [AWS Secrets Manager](docs/AWS_SECRETS.md) (single JSON secret for URLs + DB + JWT)
- DNS + TLS: Route 53 + ACM
- Logging/metrics: CloudWatch

## Production Hardening Checklist

- ~~Remove all hardcoded fallback secrets and fallback Mongo URI~~ (done for Mongo URI; JWT dev fallbacks remain for local only)
- ~~Move all secrets to managed secret storage~~ (AWS Secrets Manager supported — see docs/AWS_SECRETS.md)
- Add refresh token rotation/revocation strategy
- Tighten input validation for pages/workspaces payloads
- Add API and integration tests for critical flows
- Add CI/CD pipeline for build, test, and deploy

## Security Note

If any password or connection string was exposed during setup, rotate those credentials immediately in MongoDB Atlas.

## License

MIT
