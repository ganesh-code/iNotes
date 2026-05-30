# AWS Secrets Manager

All deployment-sensitive values (URLs, database URI, JWT secrets) live in **one JSON secret** in AWS Secrets Manager. Local development uses the root `.env` file instead.

## Secret JSON format

Create a secret (e.g. `inotes/production`) with **plain text** type and this JSON:

```json
{
  "MONGO_URL": "mongodb+srv://user:password@cluster/dbname?retryWrites=true&w=majority",
  "JWT_SECRET": "your-long-random-secret",
  "JWT_REFRESH_SECRET": "another-long-random-secret",
  "CLIENT_URL": "https://app.yourdomain.com",
  "API_URL": "https://api.yourdomain.com",
  "REACT_APP_API_URL": "https://api.yourdomain.com",
  "PORT": "5500",
  "NODE_ENV": "production"
}
```

| Key | Purpose |
|-----|---------|
| `MONGO_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Auth tokens |
| `CLIENT_URL` | Frontend URL for CORS (comma-separated for multiple origins) |
| `API_URL` / `REACT_APP_API_URL` | Backend API URL used by the React app |
| `PORT` | API port (Elastic Beanstalk often uses 8080 — match your platform) |

`API_URL` and `REACT_APP_API_URL` can be the same value. If only `API_URL` is set, the app copies it to `REACT_APP_API_URL`.

## Elastic Beanstalk (backend)

1. Attach an IAM instance profile with `secretsmanager:GetSecretValue` on your secret.
2. Set environment properties:

   - `NODE_ENV` = `production`
   - `AWS_SECRETS_MANAGER_SECRET_ID` = `inotes/production`
   - `AWS_REGION` = your region (e.g. `us-east-1`)

On startup the API loads the secret automatically (`backendset/config/loadAwsSecrets.js`).

## GitHub Actions (frontend deploy)

Add repository secrets:

- `AWS_SECRETS_MANAGER_SECRET_ID` — secret name or ARN
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` (already used)

The workflow runs `node scripts/ci-load-aws-secrets.js`, which:

1. Fetches the JSON secret from AWS
2. Exports `REACT_APP_API_URL` to the build
3. Generates `client/public/config.js` for runtime URL on CloudFront

Legacy: `secrets.API_URL` still works as a fallback if `AWS_SECRETS_MANAGER_SECRET_ID` is not set.

## Local development

```bash
cp .env.example .env
# edit URLs and secrets

node scripts/generate-client-config.js   # writes client/public/config.js
cd backendset && npm start
cd client && npm start
```

`prestart` / `prebuild:local` run the config generator automatically.

## Verify

```bash
curl http://localhost:5500/api/config/public
# { "apiUrl": "http://localhost:5500", "clientUrl": "http://localhost:3000" }
```
