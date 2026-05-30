/**
 * Backend API origin — no hardcoded production URLs.
 *
 * Resolution order:
 * 1. window.INOTES_CONFIG.API_URL (client/public/config.js — deploy / AWS)
 * 2. REACT_APP_API_URL or API_URL (root .env via env-cmd, or CI build env)
 * 3. Development default (localhost only)
 */
function trimUrl(value) {
  return String(value).trim().replace(/\/$/, '');
}

function fromRuntimeConfig() {
  if (typeof window === 'undefined') return '';
  const url = window.INOTES_CONFIG?.API_URL;
  return url ? trimUrl(url) : '';
}

function fromBuildEnv() {
  const raw = process.env.REACT_APP_API_URL || process.env.API_URL;
  return raw ? trimUrl(raw) : '';
}

function resolveApiBase() {
  const runtime = fromRuntimeConfig();
  if (runtime) return runtime;

  const build = fromBuildEnv();
  if (build) return build;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'API URL is not configured. Set REACT_APP_API_URL in AWS Secrets Manager, ' +
        'generate client/public/config.js, or define it at build time.'
    );
  }

  return 'http://localhost:5500';
}

export const API_BASE = resolveApiBase();
