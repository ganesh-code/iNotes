/**
 * Single source of truth for the backend API origin.
 *
 * Set REACT_APP_API_URL in:
 * - `.env.development` / `.env.local` for local dev (Create React App)
 * - CI or `.env.production` before `npm run build`
 *
 * Do not hardcode hostnames elsewhere in the client.
 */
function resolveApiBase() {
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'REACT_APP_API_URL is not set. Define it before building (e.g. CI env or .env.production).'
    );
  }
  // Development and test: default local API (override with .env.development)
  return 'http://localhost:5500';
}

export const API_BASE = resolveApiBase();
