import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { AgentCard } from '../components/aicouncil/AgentCard';
import { ConsensusPanel } from '../components/aicouncil/ConsensusPanel';
import { useSimulation } from '../context/SimulationContext';
import { runCouncilAnalysis } from '../lib/council/agents';
import { buildConsensus } from '../lib/council/consensus';
import { RefreshCw } from 'lucide-react';

export default function AICouncil() {
  const { assets, workers, zones, scenario } = useSimulation();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const prevPhase = useRef(scenario.phase);

  useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      const riskiest = [...assets].sort((a, b) => b.riskScore - a.riskScore)[0];
      setSelectedAssetId(riskiest.id);
    }
  }, [assets, selectedAssetId]);

  // Auto-convene the council the moment the scenario turns critical —
  // so a live demo naturally shows the "experts collaborating" moment
  // without anyone needing to click anything.
  useEffect(() => {
    if (prevPhase.current !== 'critical' && scenario.phase === 'critical') {
      const worst = [...assets].sort((a, b) => b.riskScore - a.riskScore)[0];
      setSelectedAssetId(worst.id);
      setRunId((r) => r + 1);
    }
    prevPhase.current = scenario.phase;
  }, [scenario.phase, assets]);

  const asset = assets.find((a) => a.id === selectedAssetId) ?? assets[0];
  const zone = zones.find((z) => z.id === asset?.zoneId);
  const workersInZone = useMemo(
    () => workers.filter((w) => w.zoneId === asset?.zoneId),
    [workers, asset?.zoneId]
  );

  const findings = asset ? runCouncilAnalysis(asset, zone, workersInZone) : [];
  const consensus = asset ? buildConsensus(asset, zone?.name ?? 'the affected zone', findings) : null;
  const tone = asset?.status === 'critical' ? 'danger' : asset?.status === 'warning' ? 'warn' : 'safe';

  if (!asset || !consensus) {
    return (
      <AppShell title="AI Council" description="Multi-expert reasoning and consensus recommendations">
        <p className="text-sm text-[var(--atlas-text-tertiary)]">Loading plant data…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="AI Council" description="Six domain experts reason independently, then reach consensus">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="asset-select" className="text-xs text-[var(--atlas-text-tertiary)]">
            Analyzing:
          </label>
          <select
            id="asset-select"
            value={asset.id}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              setRunId((r) => r + 1);
            }}
            className="rounded-lg border border-white/10 bg-[var(--atlas-panel)] px-2.5 py-1.5 text-sm text-[var(--atlas-text-primary)] outline-none focus:border-[var(--atlas-accent)]"
          >
            {[...assets]
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.status})
                </option>
              ))}
          </select>
        </div>
        <button
          onClick={() => setRunId((r) => r + 1)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[var(--atlas-text-secondary)] transition-colors hover:bg-white/5"
        >
          <RefreshCw size={13} />
          Re-run Council Analysis
        </button>
      </div>

      <div key={runId} className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {findings.map((finding, i) => (
          <AgentCard key={finding.agentId} finding={finding} delayMs={i * 90} />
        ))}
      </div>

      <ConsensusPanel consensus={consensus} tone={tone} />

      <GlassPanel className="mt-4 !bg-transparent !border-white/5">
        <p className="text-xs leading-relaxed text-[var(--atlas-text-tertiary)]">
          Each expert reasons independently over live sensor data, remaining useful life, and worker
          proximity — this is rule-based reasoning today (deterministic, so it never breaks mid-demo),
          designed to plug into an LLM-backed reasoning layer later without changing this page.
        </p>
      </GlassPanel>
    </AppShell>
  );
}