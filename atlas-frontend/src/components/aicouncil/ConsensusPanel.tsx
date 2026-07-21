import { Gavel } from 'lucide-react';
import type { ConsensusResult } from '../../lib/council/consensus';
import { GlassPanel } from '../ui/GlassPanel';

interface ConsensusPanelProps {
  consensus: ConsensusResult;
  tone: 'safe' | 'warn' | 'danger';
}

const TONE_COLOR: Record<ConsensusPanelProps['tone'], string> = {
  safe: 'var(--atlas-safe)',
  warn: 'var(--atlas-warn)',
  danger: 'var(--atlas-danger)',
};

export function ConsensusPanel({ consensus, tone }: ConsensusPanelProps) {
  const color = TONE_COLOR[tone];
  return (
    <GlassPanel style={{ borderColor: `${color}40` }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}1a` }}
          >
            <Gavel size={20} color={color} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
              Council Consensus
            </p>
            <p className="mt-1 max-w-xl text-base font-medium leading-snug">{consensus.action}</p>
            <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">{consensus.basis}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="mono-data text-3xl font-semibold" style={{ color }}>
            {consensus.confidence}%
          </p>
          <p className="text-xs text-[var(--atlas-text-tertiary)]">confidence</p>
        </div>
      </div>
    </GlassPanel>
  );
}