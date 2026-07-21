import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { ZoneHeatTile } from '../components/emergency/ZoneHeatTile';
import { ResponseTimeline } from '../components/emergency/ResponseTimeline';
import { useSimulation } from '../context/SimulationContext';
import { RISK_LEVEL_COLOR } from '../lib/simulation/assetVisuals';
import { AlertOctagon, Grid3x3, Radio } from 'lucide-react';
import type { RiskLevel } from '../lib/simulation/types';

const ASSEMBLY_POINT: Record<string, string> = {
  'zone-a': 'Assembly Point 1 — North Gate',
  'zone-b': 'Assembly Point 2 — East Perimeter',
  'zone-c': 'Assembly Point 1 — North Gate',
  'zone-d': 'Assembly Point 3 — South Yard',
  'zone-e': 'Assembly Point 3 — South Yard',
  'zone-safe': 'N/A — already a safe zone',
};

const RECOMMENDED_ACTION: Record<RiskLevel, string> = {
  green: 'No action needed — continue standard operations.',
  yellow: 'Increase monitoring frequency in this zone.',
  orange: 'Restrict to essential personnel only.',
  red: 'Evacuate immediately — assemble at nearest muster point.',
};

type View = 'heatmap' | 'evacuation';

export default function EmergencyResponse() {
  const { zones, assets, workers, alerts } = useSimulation();
  const [view, setView] = useState<View>('heatmap');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const emergencyActive = zones.some((z) => z.riskLevel === 'red');
  const sortedZones = [...zones].sort((a, b) => b.riskScore - a.riskScore);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <AppShell
      title="Emergency Response Orchestrator"
      description="Risk heatmap, evacuation guidance & live response timeline"
    >
      {emergencyActive && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[var(--atlas-danger)]/40 bg-[var(--atlas-danger)]/10 px-4 py-3">
          <AlertOctagon size={20} className="shrink-0 text-[var(--atlas-danger)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--atlas-danger)]">EMERGENCY MODE ACTIVE</p>
            <p className="text-xs text-[var(--atlas-danger)]/80">
              One or more zones are at critical risk. Switch to Evacuation &amp; Response for guidance.
            </p>
          </div>
        </div>
      )}

      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setView('heatmap')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            view === 'heatmap'
              ? 'bg-[var(--atlas-accent-dim)] text-[var(--atlas-accent)]'
              : 'text-[var(--atlas-text-secondary)] hover:bg-white/5'
          }`}
        >
          <Grid3x3 size={14} />
          Risk Heatmap
        </button>
        <button
          onClick={() => setView('evacuation')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            view === 'evacuation'
              ? 'bg-[var(--atlas-accent-dim)] text-[var(--atlas-accent)]'
              : 'text-[var(--atlas-text-secondary)] hover:bg-white/5'
          }`}
        >
          <Radio size={14} />
          Evacuation &amp; Response
        </button>
      </div>

      {view === 'heatmap' ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedZones.map((zone) => (
              <ZoneHeatTile
                key={zone.id}
                zone={zone}
                assets={assets.filter((a) => a.zoneId === zone.id)}
                workers={workers.filter((w) => w.zoneId === zone.id)}
                isSelected={zone.id === selectedZoneId}
                onSelect={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
              />
            ))}
          </div>

          {selectedZone && (
            <GlassPanel className="mt-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{selectedZone.name}</p>
                  <p className="mt-1 text-xs text-[var(--atlas-text-secondary)]">
                    {RECOMMENDED_ACTION[selectedZone.riskLevel]}
                  </p>
                  <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">
                    Nearest assembly point: {ASSEMBLY_POINT[selectedZone.id]}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="mono-data text-2xl font-semibold"
                    style={{ color: RISK_LEVEL_COLOR[selectedZone.riskLevel] }}
                  >
                    {selectedZone.riskScore}
                  </p>
                  <p className="text-xs text-[var(--atlas-text-tertiary)]">risk score</p>
                </div>
              </div>
              <div className="mt-3 border-t border-white/5 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                  Workers in this zone
                </p>
                {workers.filter((w) => w.zoneId === selectedZone.id).length === 0 ? (
                  <p className="text-xs text-[var(--atlas-text-tertiary)]">None currently.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {workers
                      .filter((w) => w.zoneId === selectedZone.id)
                      .map((w) => (
                        <li key={w.id} className="flex justify-between text-sm">
                          <span>{w.name}</span>
                          <span className="text-xs text-[var(--atlas-text-tertiary)]">{w.task}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </GlassPanel>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {sortedZones.map((zone) => (
              <GlassPanel key={zone.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{zone.name}</p>
                    <p className="mt-1 text-xs text-[var(--atlas-text-secondary)]">
                      {RECOMMENDED_ACTION[zone.riskLevel]}
                    </p>
                    <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">
                      {workers.filter((w) => w.zoneId === zone.id).length} worker(s) ·{' '}
                      {ASSEMBLY_POINT[zone.id]}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
                    style={{
                      color: RISK_LEVEL_COLOR[zone.riskLevel],
                      background: `${RISK_LEVEL_COLOR[zone.riskLevel]}22`,
                    }}
                  >
                    {zone.riskLevel}
                  </span>
                </div>
              </GlassPanel>
            ))}
          </div>

          <GlassPanel>
            <h3 className="mb-4 font-[var(--font-display)] text-sm font-semibold">Response Timeline</h3>
            <ResponseTimeline alerts={alerts} />
          </GlassPanel>
        </div>
      )}
    </AppShell>
  );
}