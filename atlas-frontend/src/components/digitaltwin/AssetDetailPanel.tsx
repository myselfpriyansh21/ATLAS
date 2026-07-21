import { X } from 'lucide-react';
import type { Asset, Worker, Zone } from '../../lib/simulation/types';
import { ASSET_ICON, STATUS_COLOR } from '../../lib/simulation/assetVisuals';
import { GlassPanel } from '../ui/GlassPanel';

interface AssetDetailPanelProps {
  asset: Asset | null;
  zone: Zone | undefined;
  nearbyWorkers: Worker[];
  onClose: () => void;
}

function MetricRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
      <span className="text-xs text-[var(--atlas-text-secondary)]">{label}</span>
      <span className="mono-data text-sm">
        {value.toFixed(1)} <span className="text-[var(--atlas-text-tertiary)]">{unit}</span>
      </span>
    </div>
  );
}

export function AssetDetailPanel({ asset, zone, nearbyWorkers, onClose }: AssetDetailPanelProps) {
  if (!asset) return null;
  const Icon = ASSET_ICON[asset.type];
  const color = STATUS_COLOR[asset.status];

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[var(--atlas-bg-elevated)] p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${color}1a` }}
            >
              <Icon size={20} color={color} />
            </span>
            <div>
              <h3 className="font-[var(--font-display)] text-base font-semibold">{asset.name}</h3>
              <p className="text-xs text-[var(--atlas-text-tertiary)]">{zone?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--atlas-text-tertiary)] hover:text-[var(--atlas-text-primary)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <GlassPanel className="!p-3">
            <p className="text-xs text-[var(--atlas-text-secondary)]">Health Score</p>
            <p className="mono-data mt-1 text-2xl font-medium" style={{ color }}>
              {asset.healthScore}%
            </p>
          </GlassPanel>
          <GlassPanel className="!p-3">
            <p className="text-xs text-[var(--atlas-text-secondary)]">Risk Score</p>
            <p className="mono-data mt-1 text-2xl font-medium" style={{ color }}>
              {asset.riskScore}%
            </p>
          </GlassPanel>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
          Live Sensor Data
        </p>
        <GlassPanel className="!p-3 mb-5">
          <MetricRow label="Temperature" value={asset.metrics.temperature} unit="°C" />
          <MetricRow label="Pressure" value={asset.metrics.pressure} unit="bar" />
          <MetricRow label="Vibration" value={asset.metrics.vibration} unit="mm/s" />
          <MetricRow label="Power Draw" value={asset.metrics.powerConsumption} unit="kW" />
          {asset.metrics.gasConcentration !== undefined && (
            <MetricRow label="Gas Concentration" value={asset.metrics.gasConcentration} unit="ppm" />
          )}
        </GlassPanel>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
          Maintenance
        </p>
        <GlassPanel className="!p-3 mb-5">
          <MetricRow label="Remaining Useful Life" value={asset.remainingUsefulLifeDays} unit="days" />
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[var(--atlas-text-secondary)]">Last Maintenance</span>
            <span className="mono-data text-sm">{asset.lastMaintenance}</span>
          </div>
        </GlassPanel>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
          Nearby Workers ({nearbyWorkers.length})
        </p>
        <GlassPanel className="!p-3">
          {nearbyWorkers.length === 0 ? (
            <p className="text-xs text-[var(--atlas-text-tertiary)]">No workers currently in this zone.</p>
          ) : (
            <ul className="space-y-2">
              {nearbyWorkers.map((w) => (
                <li key={w.id} className="flex items-center justify-between text-sm">
                  <span>{w.name}</span>
                  <span className="text-xs text-[var(--atlas-text-tertiary)]">{w.task}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>

        {asset.status !== 'normal' && (
          <div
            className="mt-5 rounded-lg border px-3 py-2.5 text-xs"
            style={{ borderColor: `${color}44`, background: `${color}0d`, color }}
          >
            {asset.status === 'critical'
              ? `AI Prediction: ${asset.name} is trending toward failure. Immediate inspection recommended.`
              : `AI Prediction: ${asset.name} shows early signs of degradation. Schedule inspection.`}
          </div>
        )}
      </div>
    </>
  );
}