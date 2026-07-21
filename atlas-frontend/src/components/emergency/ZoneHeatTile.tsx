import type { Asset, Worker, Zone } from '../../lib/simulation/types';
import { RISK_LEVEL_COLOR, STATUS_COLOR } from '../../lib/simulation/assetVisuals';

interface ZoneHeatTileProps {
  zone: Zone;
  assets: Asset[];
  workers: Worker[];
  isSelected: boolean;
  onSelect: () => void;
}

export function ZoneHeatTile({ zone, assets, workers, isSelected, onSelect }: ZoneHeatTileProps) {
  const color = RISK_LEVEL_COLOR[zone.riskLevel];

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      style={{
        background: `${color}12`,
        borderColor: isSelected ? color : `${color}35`,
        boxShadow: isSelected ? `0 0 0 1px ${color}` : undefined,
      }}
    >
      <div className="flex w-full items-start justify-between">
        <p className="text-sm font-medium">{zone.name}</p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
          style={{ color, background: `${color}22` }}
        >
          {zone.riskLevel}
        </span>
      </div>
      <p className="mono-data mt-2 text-2xl font-semibold" style={{ color }}>
        {zone.riskScore}
      </p>
      <p className="text-xs text-[var(--atlas-text-tertiary)]">risk score</p>

      <div className="mt-3 flex w-full items-center justify-between text-xs text-[var(--atlas-text-tertiary)]">
        <span>{workers.length} worker{workers.length === 1 ? '' : 's'}</span>
        <span>{assets.length} asset{assets.length === 1 ? '' : 's'}</span>
      </div>

      {assets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {assets.map((a) => (
            <span
              key={a.id}
              title={a.name}
              className="h-2 w-2 rounded-full"
              style={{ background: STATUS_COLOR[a.status] }}
            />
          ))}
        </div>
      )}
    </button>
  );
}