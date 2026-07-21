import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import type { LucideIcon } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}

export function ModulePlaceholder({ title, description, icon: Icon, phase }: ModulePlaceholderProps) {
  return (
    <AppShell title={title} description={description}>
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <GlassPanel className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--atlas-accent-dim)]">
            <Icon size={22} className="text-[var(--atlas-accent)]" strokeWidth={1.75} />
          </div>
          <h2 className="font-[var(--font-display)] text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-[var(--atlas-text-secondary)]">{description}</p>
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--atlas-text-tertiary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--atlas-warn)]" />
            Arrives in {phase}
          </div>
        </GlassPanel>
      </div>
    </AppShell>
  );
}
