import { useState, useRef, useEffect } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VitalsWaveform } from './VitalsWaveform';

interface TopBarProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, description, onMenuClick }: TopBarProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[var(--atlas-bg)]/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-[var(--atlas-text-secondary)] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-[var(--font-display)] text-base font-semibold leading-tight">
            {title}
          </h1>
          {description && (
            <p className="hidden truncate text-xs text-[var(--atlas-text-tertiary)] sm:block">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:block">
          <VitalsWaveform status="nominal" />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 transition-colors hover:border-white/20"
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--atlas-accent-dim)] text-xs font-medium text-[var(--atlas-accent)]">
                {user?.displayName?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
            )}
            <span className="text-xs text-[var(--atlas-text-secondary)]">
              {user?.displayName?.split(' ')[0] ?? 'Account'}
            </span>
          </button>

          {menuOpen && (
            <div className="glass-panel absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden py-1">
              <div className="border-b border-white/5 px-3 py-2">
                <p className="truncate text-sm font-medium">{user?.displayName}</p>
                <p className="truncate text-xs text-[var(--atlas-text-tertiary)]">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--atlas-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--atlas-danger)]"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
