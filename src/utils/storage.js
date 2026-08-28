const PREFIX = 'textUtility.';
export const STORAGE_KEYS = {
  theme: `${PREFIX}theme`,
  settings: `${PREFIX}settings`,
  dataVersion: `${PREFIX}dataVersion`,
  draft: `${PREFIX}draft`,
};

export function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* Storage can be blocked by browser policy. */ }
}
