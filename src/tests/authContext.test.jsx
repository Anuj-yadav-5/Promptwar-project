import { vi, describe, it, expect, beforeEach } from 'vitest';

// ── Mock the entire Firebase services module ───────────────────────────────
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {},
  analytics: null,
  perf: null,
  signInWithGoogle: vi.fn(),
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  logoutUser: vi.fn(),
  resetPasswordEmail: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // No user logged in by default
    return vi.fn(); // unsubscribe function
  }),
  trackEvent: vi.fn(),
}));

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import {
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  resetPasswordEmail,
  onAuthStateChanged,
} from '../services/firebase';

// Test component that reads from AuthContext
function TestConsumer({ onRender }) {
  const ctx = useAuth();
  onRender(ctx);
  return null;
}

function renderWithAuth(onRender) {
  return render(
    <AuthProvider>
      <TestConsumer onRender={onRender} />
    </AuthProvider>
  );
}

describe('AuthContext — Initial State', () => {
  it('provides null user when not authenticated', async () => {
    let ctx;
    await act(async () => {
      renderWithAuth((c) => { ctx = c; });
    });
    expect(ctx.user).toBeNull();
  });

  it('exposes login, register, logout, resetPassword functions', async () => {
    let ctx;
    await act(async () => {
      renderWithAuth((c) => { ctx = c; });
    });
    expect(typeof ctx.login).toBe('function');
    expect(typeof ctx.register).toBe('function');
    expect(typeof ctx.logout).toBe('function');
    expect(typeof ctx.resetPassword).toBe('function');
    expect(typeof ctx.loginWithGoogle).toBe('function');
  });
});

describe('AuthContext — Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return vi.fn(); });
  });

  it('returns success: true on successful email login', async () => {
    loginWithEmail.mockResolvedValueOnce({ user: { uid: '123' } });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.login('test@test.com', 'password123'); });
    expect(result.success).toBe(true);
  });

  it('returns success: false with friendly error on login failure', async () => {
    loginWithEmail.mockRejectedValueOnce({ code: 'auth/wrong-password' });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.login('test@test.com', 'wrongpass'); });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Incorrect password');
  });

  it('returns friendly error for unknown error codes', async () => {
    loginWithEmail.mockRejectedValueOnce({ code: 'auth/unknown-error-xyz' });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.login('test@test.com', 'pass'); });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Something went wrong');
  });
});

describe('AuthContext — Register Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return vi.fn(); });
  });

  it('returns success: true on successful registration', async () => {
    registerWithEmail.mockResolvedValueOnce({ user: { uid: 'new-uid' } });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.register('John Doe', 'john@test.com', 'password123'); });
    expect(result.success).toBe(true);
  });

  it('returns success: false when email already in use', async () => {
    registerWithEmail.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.register('Jane', 'taken@test.com', 'pass123'); });
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('AuthContext — Logout & Password Reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return vi.fn(); });
  });

  it('calls logoutUser on logout()', async () => {
    logoutUser.mockResolvedValueOnce();
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });
    await act(async () => { await ctx.logout(); });
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it('returns success: true on valid password reset email', async () => {
    resetPasswordEmail.mockResolvedValueOnce();
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.resetPassword('user@test.com'); });
    expect(result.success).toBe(true);
  });

  it('returns success: false when reset email fails', async () => {
    resetPasswordEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
    let ctx;
    await act(async () => { renderWithAuth((c) => { ctx = c; }); });

    let result;
    await act(async () => { result = await ctx.resetPassword('ghost@test.com'); });
    expect(result.success).toBe(false);
    expect(result.error).toContain('No account found');
  });
});

describe('AuthContext — Hook Guard', () => {
  it('throws if useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer onRender={() => {}} />);
    }).toThrow();
    spy.mockRestore();
  });
});
