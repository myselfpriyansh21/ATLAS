import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useAuth } from '../context/AuthContext';
import { checkMlServiceHealth, ML_SERVICE_URL } from '../lib/ml/mlClient';
import { checkBackendHealth, API_BASE_URL } from '../lib/api/backendClient';
import { LogOut, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

type ServiceState = 'checking' | 'online' | 'offline';

function StatusDot({ state }: { state: ServiceState }) {
  if (state === 'checking') return <HelpCircle size={16} className="text-[var(--atlas-text-tertiary)]" />;
  if (state === 'online') return <CheckCircle2 size={16} className="text-[var(--atlas-safe)]" />;
  return <XCircle size={16} className="text-[var(--atlas-danger)]" />;
}

function ServiceRow({
  name,
  url,
  state,
  detail,
}: {
  name: string;
  url: string;
  state: ServiceState;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="mono-data text-xs text-[var(--atlas-text-tertiary)]">{url}</p>
        {detail && <p className="mt-0.5 text-xs text-[var(--atlas-text-tertiary)]">{detail}</p>}
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <StatusDot state={state} />
        <span
          className={
            state === 'online'
              ? 'text-[var(--atlas-safe)]'
              : state === 'offline'
                ? 'text-[var(--atlas-danger)]'
                : 'text-[var(--atlas-text-tertiary)]'
          }
        >
          {state === 'checking' ? 'Checking…' : state === 'online' ? 'Connected' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const [mlState, setMlState] = useState<ServiceState>('checking');
  const [backendState, setBackendState] = useState<ServiceState>('checking');
  const [backendDetail, setBackendDetail] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const mlOnline = await checkMlServiceHealth();
      if (!cancelled) setMlState(mlOnline ? 'online' : 'offline');

      const backendHealth = await checkBackendHealth();
      if (!cancelled) {
        setBackendState(backendHealth.ok ? 'online' : 'offline');
        if (backendHealth.ok) {
          setBackendDetail(
            `Database: ${backendHealth.database ? 'connected' : 'not configured'} · Gemini: ${
              backendHealth.gemini ? 'configured' : 'not configured'
            }`
          );
        }
      }
    }

    check();
    const handle = setInterval(check, 8000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, []);

  return (
    <AppShell title="Settings" description="Account, connections, and platform info">
      <div className="max-w-2xl space-y-4">
        <GlassPanel>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
            Account
          </p>
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--atlas-accent-dim)] text-lg font-medium text-[var(--atlas-accent)]">
                {user?.displayName?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{user?.displayName ?? 'Signed in'}</p>
              <p className="text-xs text-[var(--atlas-text-tertiary)]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[var(--atlas-text-secondary)] transition-colors hover:border-[var(--atlas-danger)]/40 hover:text-[var(--atlas-danger)]"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </GlassPanel>

        <GlassPanel>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
            Connected Services
          </p>
          <ServiceRow name="ML Microservice" url={ML_SERVICE_URL} state={mlState} />
          <ServiceRow name="Backend" url={API_BASE_URL} state={backendState} detail={backendDetail} />
          <ServiceRow name="Firebase Auth" url="firebase.google.com" state="online" />
        </GlassPanel>

        <GlassPanel>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
            About ATLAS
          </p>
          <p className="text-sm text-[var(--atlas-text-secondary)]">
            Autonomous Twin &amp; Live Adaptive Safety Intelligence — built for the ET India Hackathon.
          </p>
          <p className="mt-2 text-xs text-[var(--atlas-text-tertiary)]">
            React + Vite frontend · Node/Express + PostgreSQL + pgvector backend · Python/scikit-learn ML
            service · Firebase Auth
          </p>
        </GlassPanel>
      </div>
    </AppShell>
  );
}