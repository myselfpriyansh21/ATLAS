import { useMemo } from 'react';
import type { Asset, Worker, Zone } from '../../lib/simulation/types';
import { ASSET_ICON, STATUS_COLOR, RISK_LEVEL_COLOR } from '../../lib/simulation/assetVisuals';

interface PlantCanvasProps {
  assets: Asset[];
  workers: Worker[];
  zones: Zone[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

// Deterministic pseudo-random offset per worker id so markers stay put
// between renders instead of jittering every tick.
function hashOffset(id: string, range: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  return (hash / 1000) * range;
}

export function PlantCanvas({ assets, workers, zones, selectedAssetId, onSelectAsset }: PlantCanvasProps) {
  const zoneById = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);

  return (
    <div
      className="bg-grid relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[var(--atlas-bg-elevated)]"
      style={{ aspectRatio: '16 / 10', minHeight: '380px' }}
    >
      {/* Zones */}
      {zones.map((zone) => (
        <div
          key={zone.id}
          className="absolute rounded-xl border transition-colors duration-700"
          style={{
            left: `${zone.bounds.x}%`,
            top: `${zone.bounds.y}%`,
            width: `${zone.bounds.width}%`,
            height: `${zone.bounds.height}%`,
            background: `${RISK_LEVEL_COLOR[zone.riskLevel]}14`,
            borderColor: `${RISK_LEVEL_COLOR[zone.riskLevel]}40`,
          }}
        >
          <span className="absolute left-2 top-2 text-[10px] uppercase tracking-wide text-[var(--atlas-text-tertiary)]">
            {zone.name}
          </span>
        </div>
      ))}

      {/* Workers */}
      {workers.map((worker) => {
        const zone = zoneById.get(worker.zoneId);
        if (!zone) return null;
        const ox = hashOffset(worker.id + 'x', Math.max(zone.bounds.width - 10, 4)) + 5;
        const oy = hashOffset(worker.id + 'y', Math.max(zone.bounds.height - 14, 4)) + 8;
        return (
          <div
            key={worker.id}
            title={`${worker.name} — ${worker.task}`}
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
            style={{ left: `${zone.bounds.x + ox}%`, top: `${zone.bounds.y + oy}%` }}
          />
        );
      })}

      {/* Assets */}
      {assets.map((asset) => {
        const Icon = ASSET_ICON[asset.type];
        const color = STATUS_COLOR[asset.status];
        const isSelected = asset.id === selectedAssetId;
        return (
          <button
            key={asset.id}
            onClick={() => onSelectAsset(asset.id)}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${asset.position.x}%`, top: `${asset.position.y}%` }}
          >
            <span
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 bg-[var(--atlas-panel)] transition-transform group-hover:scale-110 ${
                isSelected ? 'scale-110' : ''
              }`}
              style={{ borderColor: color, boxShadow: isSelected ? `0 0 0 3px ${color}55` : undefined }}
            >
              {asset.status === 'critical' && (
                <span
                  className="absolute inset-0 animate-ping rounded-full"
                  style={{ background: color, opacity: 0.3 }}
                />
              )}
              <Icon size={16} color={color} strokeWidth={2} />
            </span>
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-[var(--atlas-text-secondary)] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              {asset.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}