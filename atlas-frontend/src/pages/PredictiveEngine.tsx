import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { GlassPanel } from '../components/ui/GlassPanel';
import { useSimulation } from '../context/SimulationContext';
import { computeAssetFeatures } from '../lib/ml/features';
import { predictAll, checkMlServiceHealth, ML_SERVICE_URL, type PredictAllResponse } from '../lib/ml/mlClient';
import { ASSET_ICON, STATUS_COLOR } from '../lib/simulation/assetVisuals';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const RISK_COLOR: Record<string, string> = {
  normal: 'var(--atlas-safe)',
  warning: 'var(--atlas-warn)',
  critical: 'var(--atlas-danger)',
};

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-xs">
        <span className="capitalize text-[var(--atlas-text-secondary)]">{label}</span>
        <span className="mono-data text-[var(--atlas-text-tertiary)]">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function PredictiveEngine() {
  const { assets } = useSimulation();
  const [serviceOnline, setServiceOnline] = useState<boolean | null>(null);
  const [predictions, setPredictions] = useState<Record<string, PredictAllResponse>>({});
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Default selection: whichever asset the rule-based engine currently
  // considers riskiest, so the demo lands on something interesting.
  useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      const riskiest = [...assets].sort((a, b) => b.riskScore - a.riskScore)[0];
      setSelectedAssetId(riskiest.id);
    }
  }, [assets, selectedAssetId]);

  // Health check loop
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const online = await checkMlServiceHealth();
      if (!cancelled) setServiceOnline(online);
    }
    check();
    const handle = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, []);

  // Prediction polling loop — only runs while the service is online
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!serviceOnline) return;

    async function runPredictions() {
      const results = await Promise.allSettled(
        assets.map((asset) => predictAll(computeAssetFeatures(asset), asset.id, asset.name))
      );
      const next: Record<string, PredictAllResponse> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') next[assets[i].id] = r.value;
      });
      setPredictions(next);
    }

    runPredictions();
    pollRef.current = setInterval(runPredictions, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOnline, assets.length]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedPrediction = selectedAssetId ? predictions[selectedAssetId] : undefined;

  return (
    <AppShell
      title="Predictive Engine"
      description="Real scikit-learn models: RUL regression, risk classification, anomaly detection"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {serviceOnline === null ? (
            <span className="text-[var(--atlas-text-tertiary)]">Checking ML service…</span>
          ) : serviceOnline ? (
            <span className="flex items-center gap-1.5 text-[var(--atlas-safe)]">
              <Wifi size={14} /> Connected — {ML_SERVICE_URL}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[var(--atlas-danger)]">
              <WifiOff size={14} /> ML service offline
            </span>
          )}
        </div>
      </div>

      {serviceOnline === false && (
        <GlassPanel className="mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--atlas-warn)]" />
            <div>
              <p className="text-sm font-medium">Can't reach the ML service</p>
              <p className="mt-1 text-xs text-[var(--atlas-text-secondary)]">
                Start it in a separate terminal from the <code className="mono-data">ml-service</code> folder:
              </p>
              <pre className="mono-data mt-2 rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs text-[var(--atlas-text-primary)]">
{`cd ml-service
source venv/bin/activate   # or venv\\Scripts\\activate on Windows
uvicorn app:app --reload --port 8000`}
              </pre>
              <p className="mt-2 text-xs text-[var(--atlas-text-tertiary)]">
                This page will connect automatically once it's running — no refresh needed.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        {/* Asset list */}
        <GlassPanel className="!p-2">
          <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
            Assets
          </p>
          <div className="max-h-[560px] overflow-y-auto">
            {[...assets]
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((asset) => {
                const Icon = ASSET_ICON[asset.type];
                const pred = predictions[asset.id];
                const isSelected = asset.id === selectedAssetId;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isSelected ? 'bg-[var(--atlas-accent-dim)]' : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon size={15} color={STATUS_COLOR[asset.status]} />
                    <span className="min-w-0 flex-1 truncate text-sm">{asset.name}</span>
                    {pred && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase"
                        style={{ color: RISK_COLOR[pred.risk.risk_class], background: `${RISK_COLOR[pred.risk.risk_class]}1a` }}
                      >
                        {pred.risk.risk_class}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </GlassPanel>

        {/* Detail panel */}
        {selectedAsset && (
          <div className="space-y-4">
            <GlassPanel>
              <h3 className="font-[var(--font-display)] text-base font-semibold">{selectedAsset.name}</h3>
              <p className="text-xs text-[var(--atlas-text-tertiary)]">
                Live features: {computeAssetFeatures(selectedAsset).map((f) => f.toFixed(2)).join(' · ')}
              </p>
            </GlassPanel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Rule-based (engine) */}
              <GlassPanel>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                  Rule-Based (Simulation Engine)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="mono-data text-3xl font-medium" style={{ color: STATUS_COLOR[selectedAsset.status] }}>
                    {selectedAsset.riskScore}
                  </span>
                  <span className="text-sm text-[var(--atlas-text-tertiary)]">risk score</span>
                </div>
                <p className="mt-1 text-xs capitalize" style={{ color: STATUS_COLOR[selectedAsset.status] }}>
                  {selectedAsset.status}
                </p>
              </GlassPanel>

              {/* ML model */}
              <GlassPanel>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                  ML Model (RandomForestClassifier)
                </p>
                {selectedPrediction ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="mono-data text-3xl font-medium capitalize"
                        style={{ color: RISK_COLOR[selectedPrediction.risk.risk_class] }}
                      >
                        {selectedPrediction.risk.risk_class}
                      </span>
                    </div>
                    <div className="mt-3">
                      {Object.entries(selectedPrediction.risk.probabilities).map(([cls, p]) => (
                        <ProbabilityBar key={cls} label={cls} value={p} color={RISK_COLOR[cls]} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-[var(--atlas-text-tertiary)]">Waiting for prediction…</p>
                )}
              </GlassPanel>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <GlassPanel>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                  Remaining Useful Life
                </p>
                {selectedPrediction ? (
                  <div className="flex items-baseline gap-1">
                    <span className="mono-data text-3xl font-medium">
                      {selectedPrediction.rul.remaining_useful_life_days}
                    </span>
                    <span className="text-sm text-[var(--atlas-text-tertiary)]">days</span>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--atlas-text-tertiary)]">Waiting for prediction…</p>
                )}
                <p className="mt-1 text-xs text-[var(--atlas-text-tertiary)]">
                  RandomForestRegressor · engine estimate: {selectedAsset.remainingUsefulLifeDays} days
                </p>
              </GlassPanel>

              <GlassPanel>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
                  Anomaly Detection
                </p>
                {selectedPrediction ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: selectedPrediction.anomaly.is_anomaly ? 'var(--atlas-danger)' : 'var(--atlas-safe)',
                        boxShadow: `0 0 6px ${selectedPrediction.anomaly.is_anomaly ? 'var(--atlas-danger)' : 'var(--atlas-safe)'}`,
                      }}
                    />
                    <span className="text-sm font-medium">
                      {selectedPrediction.anomaly.is_anomaly ? 'Anomalous reading' : 'Within normal envelope'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--atlas-text-tertiary)]">Waiting for prediction…</p>
                )}
                <p className="mt-2 text-xs text-[var(--atlas-text-tertiary)]">
                  IsolationForest, trained only on nominal operating data
                </p>
              </GlassPanel>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}