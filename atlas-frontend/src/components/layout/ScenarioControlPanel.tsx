import { GlassPanel } from '../ui/GlassPanel';
import { useSimulation, useSimulationControls } from '../../context/SimulationContext';
import { PlayCircle, ShieldCheck, RotateCcw } from 'lucide-react';

const PHASE_LABEL: Record<string, string> = {
  idle: 'Nominal — no active scenario',
  nominal: 'Nominal',
  degrading: 'Degrading — risk climbing',
  critical: 'Critical — failure imminent',
  intervening: 'Intervention in progress',
  resolved: 'Resolved — incident averted',
};

const PHASE_COLOR: Record<string, string> = {
  idle: 'var(--atlas-text-secondary)',
  nominal: 'var(--atlas-safe)',
  degrading: 'var(--atlas-warn)',
  critical: 'var(--atlas-danger)',
  intervening: 'var(--atlas-warn)',
  resolved: 'var(--atlas-safe)',
};

export function ScenarioControlPanel() {
  const { scenario } = useSimulation();
  const { triggerScenario, resolveScenario, resetSimulation } = useSimulationControls();

  const canTrigger = scenario.phase === 'idle' || scenario.phase === 'resolved';
  const canResolve = scenario.phase === 'degrading' || scenario.phase === 'critical';
  const progressPct = Math.min(100, Math.round((scenario.simulatedMinutes / scenario.etaToFailureMinutes) * 100));

  return (
    <GlassPanel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-[var(--font-display)] text-sm font-semibold">Simulation Control</h3>
          <p className="mt-0.5 flex items-center gap-2 text-xs">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: PHASE_COLOR[scenario.phase], boxShadow: `0 0 6px ${PHASE_COLOR[scenario.phase]}` }}
            />
            <span style={{ color: PHASE_COLOR[scenario.phase] }}>{PHASE_LABEL[scenario.phase]}</span>
            {scenario.name && (
              <span className="mono-data text-[var(--atlas-text-tertiary)]">
                T+{scenario.simulatedMinutes}min
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canTrigger && (
            <button
              onClick={triggerScenario}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--atlas-danger)]/30 bg-[var(--atlas-danger)]/10 px-3 py-1.5 text-xs font-medium text-[var(--atlas-danger)] transition-colors hover:bg-[var(--atlas-danger)]/20"
            >
              <PlayCircle size={14} />
              Trigger Pump-17 Scenario
            </button>
          )}
          {canResolve && (
            <button
              onClick={resolveScenario}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--atlas-accent)]/30 bg-[var(--atlas-accent-dim)] px-3 py-1.5 text-xs font-medium text-[var(--atlas-accent)] transition-colors hover:bg-[var(--atlas-accent)]/20"
            >
              <ShieldCheck size={14} />
              Shut Down Pump-17
            </button>
          )}
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[var(--atlas-text-secondary)] transition-colors hover:bg-white/5"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {scenario.name && (scenario.phase === 'degrading' || scenario.phase === 'critical') && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-[var(--atlas-text-tertiary)]">
            <span>Predicted failure window</span>
            <span className="mono-data">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progressPct}%`,
                background: progressPct > 65 ? 'var(--atlas-danger)' : 'var(--atlas-warn)',
              }}
            />
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
