export function parseJson(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function asBoolean(value) {
  return value === true || value === 1 || value === '1';
}

export function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

export function toJson(value, fallback = []) {
  return JSON.stringify(value ?? fallback);
}
