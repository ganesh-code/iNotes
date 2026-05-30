const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { SECRET_KEYS } = require('./secretKeys');

function applySecretObject(secrets, { override = false } = {}) {
  if (!secrets || typeof secrets !== 'object') return;

  for (const key of SECRET_KEYS) {
    const value = secrets[key];
    if (value == null || String(value).trim() === '') continue;
    if (!override && process.env[key]) continue;
    process.env[key] = String(value).trim();
  }

  // Allow a single API_URL key to feed the React client variable
  if (secrets.API_URL && !process.env.REACT_APP_API_URL) {
    if (override || !process.env.REACT_APP_API_URL) {
      process.env.REACT_APP_API_URL = String(secrets.API_URL).trim();
    }
  }
  if (secrets.REACT_APP_API_URL && !process.env.API_URL) {
    process.env.API_URL = String(secrets.REACT_APP_API_URL).trim();
  }
}

async function loadAwsSecrets(options = {}) {
  const secretId = process.env.AWS_SECRETS_MANAGER_SECRET_ID;
  if (!secretId) {
    throw new Error('AWS_SECRETS_MANAGER_SECRET_ID is not set');
  }

  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
  const client = new SecretsManagerClient({ region });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );

  const raw = response.SecretString;
  if (!raw) {
    throw new Error(`Secret ${secretId} has no SecretString payload`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Secret ${secretId} must be a JSON object (see docs/AWS_SECRETS.md)`);
  }

  applySecretObject(parsed, options);
  console.log(`[config] Loaded AWS secret: ${secretId}`);
  return parsed;
}

module.exports = { loadAwsSecrets, applySecretObject };
