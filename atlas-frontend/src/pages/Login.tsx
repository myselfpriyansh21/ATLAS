import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { signIn, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignIn() {
    setSigningIn(true);
    await signIn();
    setSigningIn(false);
  }

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--atlas-bg)] px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--atlas-accent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="glass-panel relative w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--atlas-accent-dim)]">
            <div
              className="h-3.5 w-3.5 rounded-full bg-[var(--atlas-accent)]"
              style={{ boxShadow: '0 0 12px var(--atlas-accent)' }}
            />
          </div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
            ATLAS
          </h1>
          <p className="mt-1 text-sm text-[var(--atlas-text-secondary)]">
            Autonomous Twin &amp; Live Adaptive Safety Intelligence
          </p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white py-3 text-sm font-medium text-[#1a1a1a] transition-all hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {signingIn ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-[var(--atlas-danger)]/30 bg-[var(--atlas-danger)]/10 px-3 py-2 text-xs text-[var(--atlas-danger)]">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-[var(--atlas-text-tertiary)]">
          By continuing, you agree this is a hackathon prototype. Your session is
          managed by Google — ATLAS never sees your password.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
