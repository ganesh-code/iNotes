/** Keys loaded from root `.env` and/or AWS Secrets Manager (JSON secret). */
const SECRET_KEYS = [
  'MONGO_URL',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT',
  'NODE_ENV',
  'CLIENT_URL',
  'API_URL',
  'REACT_APP_API_URL',
];

module.exports = { SECRET_KEYS };
