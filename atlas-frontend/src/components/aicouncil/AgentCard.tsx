import type { AgentFinding } from '../../lib/council/agents';
import { GlassPanel } from '../ui/GlassPanel';

const SEVERITY_COLOR: Record<AgentFinding['severity'], string> = {
  info: 'var(--atlas-text-secondary)',
  caution: 'var(--atlas-accent)',
  warning: 'var(--atlas-warn)',
  critical: 'var(--atlas-danger)',
};

interface AgentCardProps {
  finding: AgentFinding;
  delayMs: number;
}

export function AgentCard({ finding, delayMs }: AgentCardProps) {
  const Icon = finding.icon;
  const color = SEVERITY_COLOR[finding.severity];

  return (
    <GlassPanel
      className="animate-council-in"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}1a` }}
        >
          <Icon size={16} color={color} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{finding.agentName}</p>
          <p className="truncate text-[11px] text-[var(--atlas-text-tertiary)]">{finding.role}</p>
        </div>
        <span
          className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
          style={{ color, background: `${color}1a` }}
        >
          {finding.severity}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--atlas-text-secondary)]">{finding.message}</p>

      <style>{`
        @keyframes council-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-council-in {
          animation: council-in 0.4s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-council-in { animation: none; }
        }
      `}</style>
    </GlassPanel>
  );
}