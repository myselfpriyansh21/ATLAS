import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AppShell({ title, description, children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--atlas-bg)]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--atlas-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black">Skip to main content</a>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} description={description} onMenuClick={() => setNavOpen(true)} />
        <main id="main-content" tabIndex={-1} className="bg-grid flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}