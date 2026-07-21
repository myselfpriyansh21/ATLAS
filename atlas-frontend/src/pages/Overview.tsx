import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { ScenarioControlPanel } from '../components/layout/ScenarioControlPanel';
import { useSimulation } from '../context/SimulationContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Alert } from '../lib/simulation/types';

type Tone = 'safe' | 'warn' | 'danger' | 'neutral';

const toneColor: Record<Tone, string> = {
  safe: 'var(--atlas-safe)',
  warn: 'var(--atlas-warn)',
  danger: 'var(--atlas-danger)',
  neutral: 'var(--atlas-text-secondary)',
};

const TrendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus };

function toneForScore(score: number): Tone {
  if (score >= 75) return 'safe';
  if (score >= 50) return 'warn';
  return 'danger';
}

function severityTone(severity: Alert['severity']): Tone {
  if (severity === 'critical') return 'danger';
  if (severity === 'warning') return 'warn';
  return 'neutral';
}

function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export default function Overview() {
  const snapshot = useSimulation();
  const { assets, alerts, plantHealth, safetyScore, workers } = snapshot;

  const criticalCount = assets.filter((a) => a.status === 'critical').length;
  const weakestAsset = [...assets].sort((a, b) => a.healthScore - b.healthScore)[0];

  const avgPowerDeviation =
    assets.reduce((sum, a) => {
      const base = a.baseline.powerConsumption || 1;
      return sum + Math.abs(a.metrics.powerConsumption - base) / base;
    }, 0) / assets.length;
  const operationalEfficiency = Math.round(Math.max(0, 100 - avgPowerDeviation * 100));

  const kpis = [
    { label: 'Plant Health', value: plantHealth, unit: '%', tone: toneForScore(plantHealth), trend: 'flat' as const, trendLabel: 'live' },
    { label: 'Safety Score', value: safetyScore, unit: '%', tone: toneForScore(safetyScore), trend: 'flat' as const, trendLabel: 'live' },
    { label: 'Operational Efficiency', value: operationalEfficiency, unit: '%', tone: toneForScore(operationalEfficiency), trend: 'flat' as const, trendLabel: 'derived from power draw' },
    { label: 'Weakest Asset Health', value: weakestAsset.healthScore, unit: '%', tone: toneForScore(weakestAsset.healthScore), trend: weakestAsset.healthScore < 70 ? ('down' as const) : ('flat' as const), trendLabel: weakestAsset.name },
    { label: 'Active Workers', value: workers.length, tone: 'neutral' as const, trend: 'flat' as const, trendLabel: 'on shift' },
    { label: 'Active Permits', value: 12, tone: 'neutral' as const, trend: 'up' as const, trendLabel: 'placeholder — Phase 7' },
    { label: 'Critical Risks', value: criticalCount, tone: (criticalCount > 0 ? 'danger' : 'safe') as Tone, trend: criticalCount > 0 ? ('up' as const) : ('flat' as const), trendLabel: criticalCount > 0 ? weakestAsset.name : 'none' },
    { label: 'AI Confidence', value: 92, unit: '%', tone: 'safe' as const, trend: 'flat' as const, trendLabel: 'rule-based — ML in Phase 4' },
    { label: 'Compliance Score', value: 90, unit: '%', tone: 'safe' as const, trend: 'flat' as const, trendLabel: 'placeholder — Phase 7' },
  ];

  const recommendations = criticalCount > 0
    ? [
        { tone: 'danger' as Tone, text: `Schedule immediate inspection on ${weakestAsset.name}`, time: 'Priority' },
        { tone: 'neutral' as Tone, text: `Consider reassigning non-essential workers away from ${assets.find(a => a.id === weakestAsset.id)?.zoneId ?? 'the affected zone'}`, time: 'Suggested' },
      ]
    : [
        { tone: 'neutral' as Tone, text: 'All assets within normal operating parameters', time: 'Status' },
      ];

  return (
    <AppShell
      title="Overview"
      description="Whole-plant status — live from the simulation engine"
    >
      <div className="mb-6">
        <h2 className="font-[var(--font-display)] text-xl font-semibold">
          Good to see you. Here's how the plant looks right now.
        </h2>
        <p className="mt-1 text-sm text-[var(--atlas-text-secondary)]">
          Sensor data updates every 2 seconds. Use Simulation Control below to trigger
          the Pump-17 scenario and watch the whole system react.
        </p>
      </div>

      <div className="mb-6">
        <ScenarioControlPanel />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = TrendIcon[kpi.trend];
          return (
            <GlassPanel key={kpi.label} hover>
              <div className="flex items-start justify-between">
                <p className="text-sm text-[var(--atlas-text-secondary)]">{kpi.label}</p>
                <span className="flex items-center gap-1 text-xs" style={{ color: toneColor[kpi.tone] }}>
                  <Icon size={13} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="mono-data text-3xl font-medium">{kpi.value}</span>
                {kpi.unit && <span className="mono-data text-lg text-[var(--atlas-text-tertiary)]">{kpi.unit}</span>}
              </div>
              <p className="mt-1 truncate text-xs text-[var(--atlas-text-tertiary)]">{kpi.trendLabel}</p>
            </GlassPanel>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel>
          <h3 className="mb-3 font-[var(--font-display)] text-sm font-semibold">Recent Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-[var(--atlas-text-tertiary)]">No alerts yet — plant is nominal.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <AlertRow
                  key={alert.id}
                  tone={severityTone(alert.severity)}
                  text={alert.message}
                  time={relativeTime(alert.timestamp)}
                />
              ))}
            </ul>
          )}
        </GlassPanel>

        <GlassPanel>
          <h3 className="mb-3 font-[var(--font-display)] text-sm font-semibold">AI Recommendations</h3>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <AlertRow key={i} tone={rec.tone} text={rec.text} time={rec.time} />
            ))}
          </ul>
        </GlassPanel>
      </div>
    </AppShell>
  );
}

function AlertRow({ tone, text, time }: { tone: Tone; text: string; time: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: toneColor[tone], boxShadow: `0 0 6px ${toneColor[tone]}` }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--atlas-text-primary)]">{text}</p>
        <p className="text-xs text-[var(--atlas-text-tertiary)]">{time}</p>
      </div>
    </li>
  );
}
