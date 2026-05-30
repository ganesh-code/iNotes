const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

function loadRootEnvFile() {
  const dotenv = require('dotenv');
  const result = dotenv.config({ path: ENV_PATH });

  if (result.error && !fs.existsSync(ENV_PATH)) {
    console.warn(
      `[config] Root .env not found at ${ENV_PATH}. ` +
        'Use AWS Secrets Manager in production or copy .env.example to .env for local dev.'
    );
  }

  return { path: ENV_PATH, error: result.error };
}

module.exports = { loadRootEnvFile, ROOT_DIR, ENV_PATH };
