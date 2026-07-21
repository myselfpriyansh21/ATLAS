import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../lib/nav';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/5 bg-[var(--atlas-bg-elevated)] px-3 py-6 transition-transform duration-300 ease-out md:static md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="mb-8 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--atlas-accent-dim)]">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--atlas-accent)]" style={{ boxShadow: '0 0 8px var(--atlas-accent)' }} />
          </div>
          <span className="font-[var(--font-display)] text-lg font-semibold tracking-tight">
            ATLAS
          </span>
        </div>
        <button onClick={onClose} className="text-[var(--atlas-text-tertiary)] md:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--atlas-accent-dim)] text-[var(--atlas-text-primary)]'
                    : 'text-[var(--atlas-text-secondary)] hover:bg-white/5 hover:text-[var(--atlas-text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[var(--atlas-accent)]" />
                  )}
                  <Icon size={18} strokeWidth={1.75} />
                  <span className="flex-1">{item.label}</span>
                  {item.status === 'building' && (
                    <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                      soon
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
        <p className="text-xs text-[var(--atlas-text-tertiary)]">
          Built for ET India Hackathon
        </p>
      </div>
      </aside>
    </>
  );
}
