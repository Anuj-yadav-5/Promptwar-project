import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export { app };


// Wrap analytics in try-catch — if measurementId is missing/invalid it throws
// synchronously before React mounts, causing a completely blank page.
export const analytics = (() => {
  try {
    return typeof window !== 'undefined' && firebaseConfig.measurementId
      ? getAnalytics(app)
      : null;
  } catch (e) {
    console.warn('[PulseArena] Analytics disabled:', e.message);
    return null;
  }
})();

// Firebase Performance Monitoring — tracks page load, network requests, custom traces
export const perf = (() => {
  try {
    return typeof window !== 'undefined' ? getPerformance(app) : null;
  } catch (e) {
    console.warn('[PulseArena] Performance Monitoring disabled:', e.message);
    return null;
  }
})();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── Helpers ──────────────────────────────────────────────────────────────────

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, {
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  });
  return cred;
};

export const logoutUser = () => signOut(auth);

export const resetPasswordEmail = (email) => sendPasswordResetEmail(auth, email);

// Helper for custom analytics tracking
export const trackEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export { onAuthStateChanged };
