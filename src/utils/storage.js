// Versioned localStorage store (original section 2)
import { INITIAL_ASSETS, INITIAL_HISTORY, INITIAL_ISSUES, INITIAL_SETTINGS, STORAGE_KEY, STORAGE_VERSION } from '../data/constants';

export function getDefaultStore() {
  return {
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
    settings: { ...INITIAL_SETTINGS },
    assets: JSON.parse(JSON.stringify(INITIAL_ASSETS)),
    issues: JSON.parse(JSON.stringify(INITIAL_ISSUES)),
    history: JSON.parse(JSON.stringify(INITIAL_HISTORY))
  };
}

export function validateStoreSchema(parsed) {
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.version !== STORAGE_VERSION) return false;
  if (!Array.isArray(parsed.assets) || !Array.isArray(parsed.issues) || !Array.isArray(parsed.history)) return false;
  if (!parsed.settings || typeof parsed.settings !== 'object') return false;
  return true;
}

export function loadStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = getDefaultStore();
      saveStore(seeded);
      return { data: seeded, recoveredFromError: false };
    }
    const parsed = JSON.parse(raw);
    if (!validateStoreSchema(parsed)) {
      const seeded = getDefaultStore();
      saveStore(seeded);
      return {
        data: seeded,
        recoveredFromError: true,
        errorMessage: 'Stored schema version mismatch or invalid JSON structure. Safely restored demo dataset.'
      };
    }
    return { data: parsed, recoveredFromError: false };
  } catch (err) {
    const fallback = getDefaultStore();
    return {
      data: fallback,
      recoveredFromError: true,
      errorMessage: 'Recovered from localStorage access/parse error. Running with safe defaults.'
    };
  }
}

export function saveStore(storeData) {
  try {
    const payload = {
      ...storeData,
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Could not write to localStorage.' };
  }
}
