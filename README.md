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

- `backendset/` - Express + MongoDB API
- `client/` - React application (workspace + page UI)
- `mongodbExample.js` - MongoDB CRUD example script
- `mongodbPing.js` - MongoDB connectivity check script

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

### 2) Configure environment

Create `backendset/.env`:

```env
MONGO_URL=mongodb+srv://<username>:<url-encoded-password>@<cluster>/<dbname>?retryWrites=true&w=majority
JWT_SECRET=replace_with_strong_secret
JWT_REFRESH_SECRET=replace_with_another_strong_secret
CLIENT_URL=http://localhost:3000
PORT=5500
NODE_ENV=development
```

Notes:
- Do not add spaces around `=`.
- URL-encode special characters in MongoDB password.
- Never commit real secrets.

### 3) Run backend

```bash
cd backendset
npm start
```

Expected logs:
- `Example app listening at http://localhost:5500`
- `Connected to MongoDB`

### 4) Configure frontend API URL

The React app reads **`REACT_APP_API_URL`** only from environment files (see [client/src/config/api.js](client/src/config/api.js)). Do not hardcode API hosts in components.

- Local dev: [client/.env.development](client/.env.development) sets `REACT_APP_API_URL=http://localhost:5500` (used by `npm start`).
- Production build: set `REACT_APP_API_URL` in CI or `client/.env.production` before `npm run build` (GitHub Actions uses `secrets.API_URL`).
- Copy [client/.env.example](client/.env.example) if you need a template.

### 5) Run frontend

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
- Secrets: AWS Secrets Manager / SSM Parameter Store
- DNS + TLS: Route 53 + ACM
- Logging/metrics: CloudWatch

## Production Hardening Checklist

- Remove all hardcoded fallback secrets and fallback Mongo URI
- Move all secrets to managed secret storage
- Add refresh token rotation/revocation strategy
- Tighten input validation for pages/workspaces payloads
- Add API and integration tests for critical flows
- Add CI/CD pipeline for build, test, and deploy

## Security Note

If any password or connection string was exposed during setup, rotate those credentials immediately in MongoDB Atlas.

## License

MIT
