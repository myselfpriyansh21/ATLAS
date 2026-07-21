import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PlantCanvas } from '../components/digitaltwin/PlantCanvas';
import { AssetDetailPanel } from '../components/digitaltwin/AssetDetailPanel';
import { useSimulation } from '../context/SimulationContext';

const LEGEND = [
  { label: 'Normal', color: 'var(--atlas-safe)' },
  { label: 'Warning', color: 'var(--atlas-warn)' },
  { label: 'Critical', color: 'var(--atlas-danger)' },
];

export default function DigitalTwin() {
  const { assets, workers, zones } = useSimulation();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) ?? null;
  const selectedZone = zones.find((z) => z.id === selectedAsset?.zoneId);
  const nearbyWorkers = workers.filter((w) => w.zoneId === selectedAsset?.zoneId);

  const statusCounts = {
    normal: assets.filter((a) => a.status === 'normal').length,
    warning: assets.filter((a) => a.status === 'warning').length,
    critical: assets.filter((a) => a.status === 'critical').length,
  };

  return (
    <AppShell
      title="Digital Twin"
      description="Live interactive model of the plant — click any asset for detail"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs text-[var(--atlas-text-secondary)]">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--atlas-text-tertiary)]">
          <span>{statusCounts.normal} normal</span>
          <span>{statusCounts.warning} warning</span>
          <span>{statusCounts.critical} critical</span>
        </div>
      </div>

      <PlantCanvas
        assets={assets}
        workers={workers}
        zones={zones}
        selectedAssetId={selectedAssetId}
        onSelectAsset={setSelectedAssetId}
      />

      <p className="mt-3 text-xs text-[var(--atlas-text-tertiary)]">
        {workers.length} workers on shift · white dots mark approximate worker positions within each zone
      </p>

      <AssetDetailPanel
        asset={selectedAsset}
        zone={selectedZone}
        nearbyWorkers={nearbyWorkers}
        onClose={() => setSelectedAssetId(null)}
      />
    </AppShell>
  );
}