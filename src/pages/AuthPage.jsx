import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, Shield, Zap, Activity,
  ArrowRight, User, Mail, Lock, AlertCircle, CheckCircle,
} from 'lucide-react';

/* ── Google SVG Icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.532 24.552c0-1.636-.14-3.21-.4-4.72H24.48v8.958h12.98c-.56 3.02-2.26 5.578-4.818 7.296v6.066h7.8c4.562-4.202 7.09-10.394 7.09-17.6z" fill="#4285F4"/>
      <path d="M24.48 48c6.516 0 11.984-2.162 15.978-5.848l-7.8-6.066c-2.162 1.448-4.928 2.308-8.178 2.308-6.29 0-11.622-4.25-13.526-9.962H2.9v6.256C6.876 42.898 15.076 48 24.48 48z" fill="#34A853"/>
      <path d="M10.954 28.432A14.46 14.46 0 0 1 10.04 24c0-1.54.266-3.034.746-4.432v-6.256H2.9A23.976 23.976 0 0 0 .48 24c0 3.868.928 7.53 2.42 10.688l8.054-6.256z" fill="#FBBC05"/>
      <path d="M24.48 9.606c3.544 0 6.726 1.218 9.228 3.606l6.918-6.918C36.454 2.394 30.986 0 24.48 0 15.076 0 6.876 5.102 2.9 13.312l8.054 6.256c1.904-5.712 7.236-9.962 13.526-9.962z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Reusable Input Field ─────────────────────────────────────────────────── */
function InputField({ id, label, type, value, onChange, icon: Icon, placeholder, error, autoComplete }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div className="auth-input-group">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrapper">
        <Icon size={16} className="auth-input-icon" />
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="auth-eye-btn"
            tabIndex={-1}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="auth-field-error">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ── Password strength bar ───────────────────────────────────────────────── */
function StrengthBar({ password }) {
  const getStrength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ff4d4d', '#ffaa00', '#00d4ff', '#00ff88'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[strength] }}>{labels[strength]}</p>
    </div>
  );
}

/* ── Main AuthPage ───────────────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle, user, resetPassword } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || '/stadium';

  // Already logged in → redirect
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
    setApiError('');
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (mode === 'signup' && !form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (mode === 'signup' && form.password.length < 6) errs.password = 'Minimum 6 characters.';
    if (mode === 'signup' && form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  /* ── Email / password submit ─────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);

    let res;
    if (mode === 'login') {
      res = await login(form.email, form.password);
    } else {
      res = await register(form.name, form.email, form.password);
    }

    if (!res.success) {
      setApiError(res.error);
      setSubmitting(false);
      return;
    }

    if (mode === 'signup') setSuccess('Account created! Redirecting…');
    setSubmitting(false);
    // Firebase onAuthStateChanged will update user → useEffect above will navigate
  };

  /* ── Forgot Password ─────────────────────────────────────────────────── */
  const handleForgotPassword = async () => {
    if (!form.email.trim()) {
      setErrors({ email: 'Please enter your email to reset password.' });
      return;
    }
    setSubmitting(true);
    setApiError('');
    setSuccess('');
    
    const res = await resetPassword(form.email);
    if (!res.success) {
      setApiError(res.error);
    } else {
      setSuccess('Password reset link sent! Check your email.');
    }
    setSubmitting(false);
  };

  /* ── Google Sign-In ──────────────────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setApiError('');
    const res = await loginWithGoogle();
    if (!res.success) {
      setApiError(res.error);
    }
    setGoogleLoading(false);
    // Firebase onAuthStateChanged will handle redirect
  };

  const switchMode = (m) => {
    setMode(m);
    setForm({ name: '', email: '', password: '', confirm: '' });
    setErrors({});
    setApiError('');
    setSuccess('');
  };

  return (
    <div className="auth-page">
      {/* Background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* ── Left brand panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo-row">
            <div className="auth-logo-icon">P</div>
            <span className="auth-logo-text">
              PulseArena <span className="text-neon-cyan">AI</span>
            </span>
          </div>

          <h2 className="auth-brand-headline">
            Command your crowd.<br />
            <span className="gradient-text">Intelligently.</span>
          </h2>
          <p className="auth-brand-sub">
            Real-time spatial analytics and AI-driven crowd management for the world's biggest live events.
          </p>

          <div className="auth-feature-list">
            {[
              { icon: Activity, label: 'Live crowd flow analytics' },
              { icon: Zap,      label: 'AI-powered queue routing' },
              { icon: Shield,   label: 'Proactive security alerts' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Icon size={14} className="text-neon-cyan" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="auth-stats-row">
            {[
              { val: '132K+', label: 'Peak Capacity' },
              { val: '5',     label: 'Venues Live'   },
              { val: '99.9%', label: 'Uptime'        },
            ].map(({ val, label }) => (
              <div key={label} className="auth-stat-item">
                <span className="auth-stat-val">{val}</span>
                <span className="auth-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">

          {/* Tabs */}
          <div className="auth-tabs">
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`auth-tab ${mode === m ? 'auth-tab-active' : ''}`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Sign in to your PulseArena dashboard'
                : 'Join the platform and manage live events'}
            </p>
          </div>

          {/* ── Google Sign-In button ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || submitting}
            className="auth-google-btn"
            id="google-signin-btn"
          >
            {googleLoading ? (
              <span className="auth-spinner" style={{ borderTopColor: '#4285F4', borderColor: 'rgba(66,133,244,0.3)' }} />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Signing in with Google…' : 'Continue with Google'}
          </button>

          <div className="auth-divider"><span>or continue with email</span></div>

          {/* Error / success banners */}
          {apiError && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={16} /><span>{apiError}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert auth-alert-success">
              <CheckCircle size={16} /><span>{success}</span>
            </div>
          )}

          {/* Email / password form */}
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {mode === 'signup' && (
              <InputField id="auth-name" label="Full Name" type="text"
                value={form.name} onChange={set('name')}
                icon={User} placeholder="John Doe"
                error={errors.name} autoComplete="name" />
            )}

            <InputField id="auth-email" label="Email Address" type="email"
              value={form.email} onChange={set('email')}
              icon={Mail} placeholder="you@example.com"
              error={errors.email} autoComplete="email" />

            <InputField id="auth-password" label="Password" type="password"
              value={form.password} onChange={set('password')}
              icon={Lock} placeholder={mode === 'login' ? '••••••••' : 'Min. 6 characters'}
              error={errors.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

            {mode === 'signup' && <StrengthBar password={form.password} />}

            {mode === 'signup' && (
              <InputField id="auth-confirm" label="Confirm Password" type="password"
                value={form.confirm} onChange={set('confirm')}
                icon={Lock} placeholder="Repeat password"
                error={errors.confirm} autoComplete="new-password" />
            )}

            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={handleForgotPassword} disabled={submitting || googleLoading} className="auth-forgot-btn">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={submitting || googleLoading} className="auth-submit-btn">
              {submitting ? (
                <><span className="auth-spinner" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="auth-switch-text">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="auth-switch-link">
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
