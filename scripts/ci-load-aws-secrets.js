#!/usr/bin/env node
/**
 * GitHub Actions: fetch JSON secret from AWS Secrets Manager and
 * export variables to GITHUB_ENV + generate client/public/config.js
 */
const fs = require('fs');
const path = require('path');

async function main() {
  process.env.USE_AWS_SECRETS = 'true';

  const { loadAwsSecrets } = require('../backendset/config/loadAwsSecrets');
  await loadAwsSecrets({ override: true });

  const githubEnv = process.env.GITHUB_ENV;
  const lines = [];

  for (const key of [
    'REACT_APP_API_URL',
    'API_URL',
    'CLIENT_URL',
    'MONGO_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ]) {
    if (process.env[key]) lines.push(`${key}=${process.env[key]}`);
  }

  if (githubEnv && lines.length) {
    fs.appendFileSync(githubEnv, `${lines.join('\n')}\n`);
    console.log(`[ci] Exported ${lines.length} variables to GITHUB_ENV`);
  }

  require('./generate-client-config.js');
}

main().catch((err) => {
  console.error('[ci] Failed to load AWS secrets:', err.message);
  process.exit(1);
});
