import { API_BASE_URL } from '../config/env.js';

const TOKEN_KEY = 'wwj_admin_token';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function emitCmsUpdated() {
  window.dispatchEvent(new CustomEvent('wwj:cms-updated'));
}

function createUrl(path, query = null) {
  const normalizedBase = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `${window.location.origin}${API_BASE_URL.startsWith('/') ? API_BASE_URL : `/${API_BASE_URL}`}`;
  const url = new URL(`${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' ? payload.message : payload;
    const error = new Error(message || `API request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function refreshAccessToken() {
  const payload = await fetch(createUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include'
  }).then(parseResponse);

  if (payload.accessToken || payload.token) {
    setAdminToken(payload.accessToken || payload.token);
  }

  return payload.accessToken || payload.token;
}

export async function apiRequest(path, options = {}) {
  const { auth = false, body, query, headers, retry = true, ...fetchOptions } = options;
  const requestHeaders = { ...(headers || {}) };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAdminToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(createUrl(path, query), {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: 'include',
    body: body === undefined || body instanceof FormData ? body : JSON.stringify(body)
  });

  if (response.status === 401 && auth && retry) {
    try {
      await refreshAccessToken();
      return apiRequest(path, { ...options, retry: false });
    } catch {
      clearAdminToken();
    }
  }

  return parseResponse(response);
}

export async function apiDownload(path, fileName = 'download') {
  const token = getAdminToken();
  const response = await fetch(createUrl(path), {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
