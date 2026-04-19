/**
 * @fileoverview Firestore Service — Manages cloud data persistence for user
 * activity, venue config, and analytics events using Firebase Firestore.
 *
 * All writes are fire-and-forget with silent error handling — failures will
 * never block the UI or cause crashes.
 */

import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Logs a user action to Firestore under `users/{uid}/activity`.
 * Used for Google Services integration and usage analytics.
 * Fails silently — will never throw or block the UI.
 *
 * @param {string} uid - The authenticated user's Firebase UID.
 * @param {string} action - The action name (e.g., 'join_queue', 'view_alert').
 * @param {Object} [metadata={}] - Optional metadata to store with the event.
 * @returns {Promise<void>}
 */
export async function logUserAction(uid, action, metadata = {}) {
  if (!uid || !action) return;
  try {
    const ref = collection(db, 'users', uid, 'activity');
    await addDoc(ref, {
      action,
      metadata,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Silent failure — analytics should never interrupt the UX
    console.warn('[PulseArena] Activity log failed (non-critical):', err.message);
  }
}

/**
 * Fetches remote venue configuration from Firestore.
 * Returns null if the document doesn't exist or fetch fails.
 *
 * @param {string} venueId - The ID of the venue to fetch config for.
 * @returns {Promise<Object|null>} The venue config data, or null on failure.
 */
export async function fetchVenueConfig(venueId) {
  if (!venueId) return null;
  try {
    const ref = doc(db, 'venues', venueId, 'config', 'settings');
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('[PulseArena] Venue config fetch failed (non-critical):', err.message);
    return null;
  }
}

/**
 * Saves a user's venue preference to their Firestore profile.
 *
 * @param {string} uid - The authenticated user's Firebase UID.
 * @param {string} venueId - The venue ID to persist.
 * @returns {Promise<void>}
 */
export async function saveUserVenuePreference(uid, venueId) {
  if (!uid || !venueId) return;
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { lastVenueId: venueId, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('[PulseArena] Venue preference save failed (non-critical):', err.message);
  }
}
