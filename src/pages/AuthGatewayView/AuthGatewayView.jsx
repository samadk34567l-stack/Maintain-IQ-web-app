import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Database,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  User
} from 'lucide-react';
import ToastStack from '../../components/ToastStack/ToastStack';
import './AuthGatewayView.css';

export default function AuthGatewayView({
  authScreen,
  setAuthScreen,
  prefilledLoginEmail,
  registeredUsers,
  onSignup,
  onLogin,
  settings,
  toasts,
  setToasts,
  onOpenPublicDemo
}) {
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Administrator',
    department: 'Facilities & Infrastructure Command',
    organization: settings.organizationName || 'SMIT Main Campus Facilities'
  });

  const [loginForm, setLoginForm] = useState({
    email: prefilledLoginEmail || 'admin@smit.edu.pk',
    password: 'password123'
  });

  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (prefilledLoginEmail) {
      setLoginForm((prev) => ({ ...prev, email: prefilledLoginEmail, password: '' }));
    }
  }, [prefilledLoginEmail]);

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match. Please verify both password fields.');
      return;
    }
    const res = onSignup(signupForm);
    if (!res.ok) {
      setAuthError(res.error);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = onLogin(loginForm);
    if (!res.ok) {
      setAuthError(res.error);
    }
  };

  return (
    <div className="miq-auth-shell">
      <ToastStack toasts={toasts} setToasts={setToasts} variant="auth" />

      <div className="miq-auth-showcase">
        <div className="space-y-6 max-w-xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <QrCode size={24} className="text-white" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white">MaintainIQ Enterprise</div>
                <div className="miq-fs-11 uppercase tracking-widest text-blue-400 font-bold">
                  SMIT Final Hackathon • AI & QR Asset Platform
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPublicDemo}
              className="btn btn-secondary text-xs"
            >
              <ExternalLink size={14} />
              <span>Test Public QR Scanner View</span>
            </button>
          </div>

          <div className="space-y-3 pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30">
              <Sparkles size={13} />
              <span>Step 1: Sign Up in LocalStorage → Step 2: Sign In to Administrator Command Center</span>
            </span>
            <h1 className="text-3xl miq-title-xl font-extrabold tracking-tight leading-tight text-white">
              Next-Generation QR Asset Telemetry & AI Triage Command Center.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Register campus equipment with immutable QR service tags, automate fault diagnosis with deterministic rule-based AI triage, orchestrate technician SLA workflows, and inspect real-time Recharts analytics—persisted 100% in versioned <code className="text-blue-300">localStorage</code>.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800/80 mt-8">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-blue-400" />
            <span>
              LocalStorage Auth Store Active: <strong className="text-white">{registeredUsers.length} Registered Accounts</strong>
            </span>
          </div>
          <div>Frontend-Only Architecture • Zero External Server Dependency</div>
        </div>
      </div>

      <div className="miq-col-authform">
        <div className="miq-auth-card">
          <div className="miq-auth-tabs">
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthScreen('signup');
              }}
              className={`miq-auth-tab-btn ${authScreen === 'signup' ? 'active' : ''}`}
            >
              <UserPlus size={15} />
              <span>1. Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthScreen('login');
              }}
              className={`miq-auth-tab-btn ${authScreen === 'login' ? 'active' : ''}`}
            >
              <LogIn size={15} />
              <span>2. Sign In</span>
            </button>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2 mb-4">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {authScreen === 'signup' ? (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div>
                <h2 className="text-lg font-extrabold text-white">Create Admin or Technician Account</h2>
                <p className="text-slate-400 mt-0.5">
                  Register in <code className="text-blue-300">localStorage</code> first, then sign in.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 miq-top-half miq-center-y text-slate-500" />
                  <input
                    type="text"
                    required
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    placeholder="Muhammad Ahmed"
                    className="miq-dark-input with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Work Email Address *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 miq-top-half miq-center-y text-slate-500" />
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="ahmed@smit.edu.pk"
                    className="miq-dark-input with-icon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Role *</label>
                  <select
                    value={signupForm.role}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                    className="miq-dark-select"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={signupForm.department}
                    onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                    className="miq-dark-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={signupForm.organization}
                  onChange={(e) => setSignupForm({ ...signupForm, organization: e.target.value })}
                  className="miq-dark-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="••••••"
                    className="miq-dark-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Confirm *</label>
                  <input
                    type="password"
                    required
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    placeholder="••••••"
                    className="miq-dark-input"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 mt-2">
                <UserPlus size={16} />
                <span>Create Account & Proceed</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <h2 className="text-lg font-extrabold text-white">Sign In to MaintainIQ</h2>
                <p className="text-slate-400 mt-0.5">
                  Enter your credentials or click a demo account below.
                </p>
              </div>

              {prefilledLoginEmail && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>Account registered! Enter password for <strong>{prefilledLoginEmail}</strong>.</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 miq-top-half miq-center-y text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="miq-dark-input with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 miq-top-half miq-center-y text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="miq-dark-input with-icon"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3">
                <LogIn size={16} />
                <span>Sign In to Command Center</span>
              </button>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="miq-fs-11 font-bold uppercase tracking-wider text-slate-400">
                  Saved LocalStorage Accounts (Click to Login):
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {registeredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setLoginForm({ email: u.email, password: u.password });
                        onLogin({ email: u.email, password: u.password });
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left transition"
                    >
                      <div>
                        <div className="font-bold text-white">{u.fullName}</div>
                        <div className="font-mono miq-fs-11 text-slate-400">{u.email}</div>
                      </div>
                      <span className={`badge ${u.role === 'Administrator' ? 'badge-info' : 'badge-purple'}`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
