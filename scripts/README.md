# Scripts

Utility scripts for local development and CI. Run from the **repository root**.

| Script | Description |
|--------|-------------|
| `generate-client-config.js` | Writes `client/public/config.js` from root `.env` |
| `ci-load-aws-secrets.js` | GitHub Actions: load AWS Secrets Manager → env + client config |
| `mongodb-ping.js` | Test MongoDB Atlas connectivity |
| `mongodb-example.js` | Sample CRUD against MongoDB |

```bash
node scripts/generate-client-config.js
node scripts/mongodb-ping.js
```

Optional: `mongodb.config.json` in this folder (see `mongodb.config.json.example`).
