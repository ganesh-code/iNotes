const DEV_API_URL = 'http://localhost:5500';
const DEV_CLIENT_URLS = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5501'];

function trimUrl(value) {
  if (value == null) return '';
  return String(value).trim().replace(/\/$/, '');
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isLocalDevOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function getAppConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  const apiUrl =
    trimUrl(process.env.API_URL) ||
    trimUrl(process.env.REACT_APP_API_URL) ||
    (!isProduction ? DEV_API_URL : '');

  const clientUrlsFromEnv = parseList(process.env.CLIENT_URL);
  const clientUrls = isProduction
    ? clientUrlsFromEnv
    : [...new Set([...DEV_CLIENT_URLS, ...clientUrlsFromEnv])];

  return {
    nodeEnv,
    isProduction,
    port: Number(process.env.PORT) || 5500,
    mongoUrl: process.env.MONGO_URL || process.env.MONGODB_URI || '',
    apiUrl,
    clientUrls,
    jwtSecret: process.env.JWT_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    awsSecretsSecretId: process.env.AWS_SECRETS_MANAGER_SECRET_ID || '',
  };
}

function requireSecret(name, value) {
  if (!value) {
    throw new Error(`${name} is not set. Configure root .env or AWS Secrets Manager.`);
  }
  return value;
}

function getJwtSecret() {
  const { isProduction, jwtSecret } = getAppConfig();
  if (isProduction) return requireSecret('JWT_SECRET', jwtSecret);
  return jwtSecret || 'dev-only-jwt-secret';
}

function getJwtRefreshSecret() {
  const { isProduction, jwtRefreshSecret } = getAppConfig();
  if (isProduction) return requireSecret('JWT_REFRESH_SECRET', jwtRefreshSecret);
  return jwtRefreshSecret || 'dev-only-refresh-secret';
}

module.exports = {
  getAppConfig,
  getJwtSecret,
  getJwtRefreshSecret,
  isLocalDevOrigin,
  DEV_API_URL,
};
