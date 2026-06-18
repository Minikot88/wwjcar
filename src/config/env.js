const DEFAULT_APP_NAME = 'WWJ Car Rent';
const DEFAULT_SITE_URL = 'https://wwjcar.hatyaicolorcalibratehcc.com';
const DEFAULT_PORT = 5180;
const DEFAULT_API_BASE_URL = 'https://api-wwjcar.hatyaicolorcalibratehcc.com/api';

function getEnvValue(key, fallback) {
  return import.meta.env[key] || fallback;
}

function getPort(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export const APP_NAME = getEnvValue('VITE_APP_NAME', DEFAULT_APP_NAME);
export const SITE_URL = getEnvValue('VITE_SITE_URL', DEFAULT_SITE_URL).replace(/\/$/, '');
export const CANONICAL_URL = getEnvValue('VITE_CANONICAL_URL', SITE_URL).replace(/\/$/, '');
export const PORT = getPort(getEnvValue('VITE_PORT', DEFAULT_PORT));
export const GOOGLE_SITE_VERIFICATION = getEnvValue('VITE_GOOGLE_SITE_VERIFICATION', '');
export const GA_MEASUREMENT_ID = getEnvValue('VITE_GA_MEASUREMENT_ID', '');
export const GTM_CONTAINER_ID = getEnvValue('VITE_GTM_CONTAINER_ID', '');
export const GOOGLE_BUSINESS_PROFILE_URL = getEnvValue('VITE_GOOGLE_BUSINESS_PROFILE_URL', '');
export const GOOGLE_MAPS_URL = getEnvValue('VITE_GOOGLE_MAPS_URL', '');
export const ENFORCE_HTTPS = getEnvValue('VITE_ENFORCE_HTTPS', 'true') === 'true';
export const REDIRECT_WWW = getEnvValue('VITE_REDIRECT_WWW', 'false') === 'true';
export const API_BASE_URL = getEnvValue('VITE_API_BASE_URL', DEFAULT_API_BASE_URL).replace(/\/$/, '');

export function validateEnvironment() {
  const warnings = [];

  if (!import.meta.env.VITE_APP_NAME) {
    warnings.push('VITE_APP_NAME is missing. Falling back to WWJ Car Rent.');
  }

  if (!import.meta.env.VITE_SITE_URL) {
    warnings.push(`VITE_SITE_URL is missing. Falling back to ${DEFAULT_SITE_URL}.`);
  }

  if (!import.meta.env.VITE_CANONICAL_URL) {
    warnings.push('VITE_CANONICAL_URL is missing. Falling back to VITE_SITE_URL.');
  }

  if (!import.meta.env.VITE_PORT) {
    warnings.push('VITE_PORT is missing. Falling back to 5180.');
  }

  if (!import.meta.env.VITE_API_BASE_URL) {
    warnings.push(`VITE_API_BASE_URL is missing. Falling back to ${DEFAULT_API_BASE_URL}.`);
  }

  return warnings;
}
