import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  resetPasswordEmail,
  onAuthStateChanged,
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin whitelist loaded from environment variable — never hardcoded in source
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase());

        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'U')}`,
          provider: firebaseUser.providerData[0]?.providerId || 'password',
          isAdmin,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  // ── Email / Password login ────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      await loginWithEmail(email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    try {
      await registerWithEmail(name, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await logoutUser();
  };

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    try {
      await resetPasswordEmail(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err.code) };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Only one sign-in popup allowed at a time.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/missing-email': 'Please enter your email address to reset password.',
  };
  return map[code] || `Something went wrong (${code}). Please try again.`;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
