const { loadRootEnvFile } = require('./loadEnv');
const { loadAwsSecrets } = require('./loadAwsSecrets');
const { getAppConfig, isLocalDevOrigin } = require('./appConfig');

function shouldLoadAwsSecrets() {
  if (process.env.USE_AWS_SECRETS === 'true') return true;
  if (process.env.AWS_SECRETS_MANAGER_SECRET_ID && process.env.NODE_ENV === 'production') {
    return true;
  }
  return false;
}

async function loadEnv() {
  loadRootEnvFile();

  if (shouldLoadAwsSecrets()) {
    await loadAwsSecrets({ override: true });
  }

  return getAppConfig();
}

module.exports = { loadEnv, loadRootEnvFile, getAppConfig, isLocalDevOrigin };
