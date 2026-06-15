const DEFAULT_APP_NAME = 'WWJ Car Rent';
const DEFAULT_SITE_URL = 'http://localhost:5180';
const DEFAULT_PORT = 5180;

function getEnvValue(key, fallback) {
  return import.meta.env[key] || fallback;
}

function getPort(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export const APP_NAME = getEnvValue('VITE_APP_NAME', DEFAULT_APP_NAME);
export const SITE_URL = getEnvValue('VITE_SITE_URL', DEFAULT_SITE_URL).replace(/\/$/, '');
export const PORT = getPort(getEnvValue('VITE_PORT', DEFAULT_PORT));

export function validateEnvironment() {
  const warnings = [];

  if (!import.meta.env.VITE_APP_NAME) {
    warnings.push('VITE_APP_NAME is missing. Falling back to WWJ Car Rent.');
  }

  if (!import.meta.env.VITE_SITE_URL) {
    warnings.push('VITE_SITE_URL is missing. Falling back to http://localhost:5180.');
  }

  if (!import.meta.env.VITE_PORT) {
    warnings.push('VITE_PORT is missing. Falling back to 5180.');
  }

  return warnings;
}
