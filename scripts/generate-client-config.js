#!/usr/bin/env node
/**
 * Writes client/public/config.js for runtime API URL (S3/CloudFront deploys).
 * Reads REACT_APP_API_URL or API_URL from root .env or process.env (CI).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'client/public/config.js');

require(path.join(ROOT, 'backendset/config/loadEnv')).loadRootEnvFile();

const apiUrl = (
  process.env.REACT_APP_API_URL ||
  process.env.API_URL ||
  'http://localhost:5500'
)
  .trim()
  .replace(/\/$/, '');

const contents = `// Auto-generated — do not edit. Run: node scripts/generate-client-config.js
window.INOTES_CONFIG = ${JSON.stringify({ API_URL: apiUrl }, null, 2)};
`;

fs.writeFileSync(OUT, contents, 'utf8');
console.log(`[config] Wrote ${OUT} (API_URL=${apiUrl})`);
