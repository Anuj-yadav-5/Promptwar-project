/**
 * @fileoverview Firebase Remote Config Service
 * Fetches remote app configuration values from Firebase Remote Config.
 * Enables dynamic feature flags and venue settings without redeployment.
 *
 * Configured keys in Firebase Remote Config console:
 *  - `ai_features_enabled`  {boolean} — toggle Gemini AI features
 *  - `max_queue_size`       {number}  — max users per virtual queue
 *  - `venue_mode`           {string}  — 'standard' | 'high_capacity' | 'vip'
 *  - `alert_threshold`      {number}  — density % that triggers auto-alerts
 */

import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { app } from './firebase';

/** @type {import('firebase/remote-config').RemoteConfig|null} */
let remoteConfig = null;
let initialized = false;

/**
 * Default values used before Remote Config values are fetched.
 * These ensure the app works correctly on first load or when offline.
 */
const DEFAULTS = {
  ai_features_enabled: true,
  max_queue_size: 50,
  venue_mode: 'standard',
  alert_threshold: 80,
};

/**
 * Initializes Firebase Remote Config with default values and a 1-hour fetch interval.
 * Safe to call multiple times — only initializes once.
 * @returns {import('firebase/remote-config').RemoteConfig|null}
 */
function initRemoteConfig() {
  if (initialized) return remoteConfig;
  try {
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
    remoteConfig.defaultConfig = DEFAULTS;
    initialized = true;
    return remoteConfig;
  } catch (e) {
    console.warn('[PulseArena] Remote Config init failed (non-critical):', e.message);
    return null;
  }
}

/**
 * Fetches and activates the latest Remote Config values.
 * Falls back to defaults if fetch fails (e.g. offline).
 * @returns {Promise<boolean>} true if fresh config was activated, false if cached/default
 */
export async function syncRemoteConfig() {
  const rc = initRemoteConfig();
  if (!rc) return false;
  try {
    const activated = await fetchAndActivate(rc);
    return activated;
  } catch (e) {
    console.warn('[PulseArena] Remote Config fetch failed (non-critical):', e.message);
    return false;
  }
}

/**
 * Returns a boolean Remote Config value by key.
 * @param {'ai_features_enabled'} key
 * @returns {boolean}
 */
export function getRemoteBool(key) {
  const rc = initRemoteConfig();
  if (!rc) return DEFAULTS[key] ?? false;
  try {
    return getValue(rc, key).asBoolean();
  } catch {
    return DEFAULTS[key] ?? false;
  }
}

/**
 * Returns a numeric Remote Config value by key.
 * @param {'max_queue_size'|'alert_threshold'} key
 * @returns {number}
 */
export function getRemoteNumber(key) {
  const rc = initRemoteConfig();
  if (!rc) return DEFAULTS[key] ?? 0;
  try {
    return getValue(rc, key).asNumber();
  } catch {
    return DEFAULTS[key] ?? 0;
  }
}

/**
 * Returns a string Remote Config value by key.
 * @param {'venue_mode'} key
 * @returns {string}
 */
export function getRemoteString(key) {
  const rc = initRemoteConfig();
  if (!rc) return DEFAULTS[key] ?? '';
  try {
    return getValue(rc, key).asString();
  } catch {
    return DEFAULTS[key] ?? '';
  }
}

/**
 * Fetches all PulseArena Remote Config values as a typed object.
 * @returns {Promise<typeof DEFAULTS>}
 */
export async function getAllRemoteConfig() {
  await syncRemoteConfig();
  return {
    ai_features_enabled: getRemoteBool('ai_features_enabled'),
    max_queue_size: getRemoteNumber('max_queue_size'),
    venue_mode: getRemoteString('venue_mode'),
    alert_threshold: getRemoteNumber('alert_threshold'),
  };
}
