import type { Asset, Worker, Zone } from './types';

// ─────────────────────────────────────────────────────────────
// Zones — coarse areas of the plant. Bounds are percentages of
// the Digital Twin canvas, used later for the 2D layout & heatmap.
// ─────────────────────────────────────────────────────────────
export const ZONES: Omit<Zone, 'riskScore' | 'riskLevel'>[] = [
  { id: 'zone-a', name: 'Zone A — Production Unit', bounds: { x: 4, y: 6, width: 40, height: 34 } },
  { id: 'zone-b', name: 'Zone B — Boiler & Cooling', bounds: { x: 48, y: 6, width: 48, height: 34 } },
  { id: 'zone-c', name: 'Zone C — Storage & Pumps', bounds: { x: 4, y: 44, width: 40, height: 34 } },
  { id: 'zone-d', name: 'Zone D — Compressor House', bounds: { x: 48, y: 44, width: 24, height: 34 } },
  { id: 'zone-e', name: 'Zone E — Warehouse & Loading', bounds: { x: 76, y: 44, width: 20, height: 34 } },
  { id: 'zone-safe', name: 'Control Room', bounds: { x: 4, y: 82, width: 92, height: 14 } },
];

function seedAsset(partial: {
  id: string;
  name: string;
  type: Asset['type'];
  zoneId: string;
  position: { x: number; y: number };
  baseline: Asset['metrics'];
  thresholds: Asset['thresholds'];
  rulDays: number;
  lastMaintenance: string;
}): Asset {
  return {
    id: partial.id,
    name: partial.name,
    type: partial.type,
    zoneId: partial.zoneId,
    position: partial.position,
    metrics: { ...partial.baseline },
    baseline: { ...partial.baseline },
    thresholds: partial.thresholds,
    healthScore: 100,
    riskScore: 0,
    status: 'normal',
    remainingUsefulLifeDays: partial.rulDays,
    lastMaintenance: partial.lastMaintenance,
  };
}

// ─────────────────────────────────────────────────────────────
// Assets — Pump-17 is the demo centerpiece (Zone C). Overdue
// maintenance + tight thresholds so the scripted scenario reads
// as plausible, not arbitrary.
// ─────────────────────────────────────────────────────────────
export const INITIAL_ASSETS: Asset[] = [
  seedAsset({
    id: 'pump-17',
    name: 'Pump-17',
    type: 'pump',
    zoneId: 'zone-c',
    position: { x: 18, y: 58 },
    baseline: { temperature: 58, pressure: 4.2, vibration: 2.1, powerConsumption: 46, gasConcentration: 8 },
    thresholds: {
      temperature: { safeMax: 75, criticalMax: 130 },
      pressure: { safeMax: 6.5, criticalMax: 9.5 },
      vibration: { safeMax: 4.5, criticalMax: 9 },
      gasConcentration: { safeMax: 25, criticalMax: 80 },
    },
    rulDays: 6,
    lastMaintenance: '2026-04-02',
  }),
  seedAsset({
    id: 'pump-04',
    name: 'Pump-04',
    type: 'pump',
    zoneId: 'zone-c',
    position: { x: 30, y: 66 },
    baseline: { temperature: 54, pressure: 4.0, vibration: 1.8, powerConsumption: 42 },
    thresholds: {
      temperature: { safeMax: 75, criticalMax: 130 },
      pressure: { safeMax: 6.5, criticalMax: 9.5 },
      vibration: { safeMax: 4.5, criticalMax: 9 },
    },
    rulDays: 210,
    lastMaintenance: '2026-06-18',
  }),
  seedAsset({
    id: 'boiler-2',
    name: 'Boiler-2',
    type: 'boiler',
    zoneId: 'zone-b',
    position: { x: 58, y: 16 },
    baseline: { temperature: 610, pressure: 38, vibration: 1.2, powerConsumption: 310 },
    thresholds: {
      temperature: { safeMax: 850, criticalMax: 950 },
      pressure: { safeMax: 55, criticalMax: 65 },
    },
    rulDays: 340,
    lastMaintenance: '2026-05-10',
  }),
  seedAsset({
    id: 'cooling-tower-1',
    name: 'Cooling Tower-1',
    type: 'coolingTower',
    zoneId: 'zone-b',
    position: { x: 82, y: 16 },
    baseline: { temperature: 32, pressure: 1.4, vibration: 1.0, powerConsumption: 90 },
    thresholds: {
      temperature: { safeMax: 42, criticalMax: 55 },
    },
    rulDays: 400,
    lastMaintenance: '2026-03-22',
  }),
  seedAsset({
    id: 'tank-a',
    name: 'Storage Tank-A',
    type: 'tank',
    zoneId: 'zone-c',
    position: { x: 14, y: 74 },
    baseline: { temperature: 28, pressure: 1.1, vibration: 0.2, powerConsumption: 5 },
    thresholds: { temperature: { safeMax: 45, criticalMax: 60 } },
    rulDays: 900,
    lastMaintenance: '2026-01-15',
  }),
  seedAsset({
    id: 'tank-b',
    name: 'Storage Tank-B',
    type: 'tank',
    zoneId: 'zone-c',
    position: { x: 34, y: 78 },
    baseline: { temperature: 27, pressure: 1.0, vibration: 0.2, powerConsumption: 5 },
    thresholds: { temperature: { safeMax: 45, criticalMax: 60 } },
    rulDays: 880,
    lastMaintenance: '2026-01-15',
  }),
  seedAsset({
    id: 'compressor-1',
    name: 'Compressor-1',
    type: 'compressor',
    zoneId: 'zone-d',
    position: { x: 56, y: 58 },
    baseline: { temperature: 68, pressure: 12, vibration: 2.6, powerConsumption: 130 },
    thresholds: {
      temperature: { safeMax: 95, criticalMax: 115 },
      vibration: { safeMax: 5.5, criticalMax: 10 },
    },
    rulDays: 150,
    lastMaintenance: '2026-05-28',
  }),
  seedAsset({
    id: 'compressor-2',
    name: 'Compressor-2',
    type: 'compressor',
    zoneId: 'zone-d',
    position: { x: 66, y: 70 },
    baseline: { temperature: 65, pressure: 11.5, vibration: 2.4, powerConsumption: 126 },
    thresholds: {
      temperature: { safeMax: 95, criticalMax: 115 },
      vibration: { safeMax: 5.5, criticalMax: 10 },
    },
    rulDays: 175,
    lastMaintenance: '2026-05-28',
  }),
  seedAsset({
    id: 'generator-1',
    name: 'Generator-1',
    type: 'generator',
    zoneId: 'zone-d',
    position: { x: 60, y: 78 },
    baseline: { temperature: 72, pressure: 2.1, vibration: 2.0, powerConsumption: 480 },
    thresholds: { temperature: { safeMax: 105, criticalMax: 125 } },
    rulDays: 260,
    lastMaintenance: '2026-04-30',
  }),
  seedAsset({
    id: 'motor-12',
    name: 'Motor-12',
    type: 'motor',
    zoneId: 'zone-a',
    position: { x: 16, y: 16 },
    baseline: { temperature: 62, pressure: 0, vibration: 1.6, powerConsumption: 38 },
    thresholds: { temperature: { safeMax: 90, criticalMax: 110 }, vibration: { safeMax: 4, criticalMax: 8 } },
    rulDays: 120,
    lastMaintenance: '2026-06-01',
  }),
  seedAsset({
    id: 'valve-9',
    name: 'Valve-9',
    type: 'valve',
    zoneId: 'zone-a',
    position: { x: 32, y: 28 },
    baseline: { temperature: 40, pressure: 5.2, vibration: 0.4, powerConsumption: 2 },
    thresholds: { pressure: { safeMax: 8, criticalMax: 11 } },
    rulDays: 500,
    lastMaintenance: '2026-02-19',
  }),
  seedAsset({
    id: 'pipeline-main',
    name: 'Pipeline — Main Feed',
    type: 'pipeline',
    zoneId: 'zone-a',
    position: { x: 8, y: 30 },
    baseline: { temperature: 48, pressure: 6.0, vibration: 0.6, powerConsumption: 0 },
    thresholds: { pressure: { safeMax: 9, criticalMax: 12 } },
    rulDays: 700,
    lastMaintenance: '2026-03-05',
  }),
  seedAsset({
    id: 'warehouse-1',
    name: 'Warehouse-1',
    type: 'warehouse',
    zoneId: 'zone-e',
    position: { x: 84, y: 58 },
    baseline: { temperature: 30, pressure: 0, vibration: 0, powerConsumption: 12 },
    thresholds: {},
    rulDays: 999,
    lastMaintenance: '2025-11-11',
  }),
  seedAsset({
    id: 'control-room',
    name: 'Control Room',
    type: 'controlRoom',
    zoneId: 'zone-safe',
    position: { x: 50, y: 89 },
    baseline: { temperature: 24, pressure: 0, vibration: 0, powerConsumption: 8 },
    thresholds: {},
    rulDays: 999,
    lastMaintenance: '2025-12-01',
  }),
];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w-1', name: 'R. Sharma', zoneId: 'zone-c', task: 'Pump inspection round', heartRate: 78, fatigueScore: 22, ppeCompliant: true },
  { id: 'w-2', name: 'A. Verma', zoneId: 'zone-c', task: 'Valve calibration', heartRate: 82, fatigueScore: 35, ppeCompliant: true },
  { id: 'w-3', name: 'S. Iyer', zoneId: 'zone-b', task: 'Boiler pressure check', heartRate: 75, fatigueScore: 18, ppeCompliant: true },
  { id: 'w-4', name: 'K. Nair', zoneId: 'zone-d', task: 'Compressor monitoring', heartRate: 80, fatigueScore: 40, ppeCompliant: true },
  { id: 'w-5', name: 'P. Singh', zoneId: 'zone-a', task: 'Motor lubrication', heartRate: 77, fatigueScore: 28, ppeCompliant: false },
  { id: 'w-6', name: 'M. Das', zoneId: 'zone-e', task: 'Loading dock supervision', heartRate: 73, fatigueScore: 15, ppeCompliant: true },
  { id: 'w-7', name: 'T. Reddy', zoneId: 'zone-safe', task: 'Control room shift lead', heartRate: 70, fatigueScore: 10, ppeCompliant: true },
  { id: 'w-8', name: 'J. Fernandes', zoneId: 'zone-d', task: 'Generator diagnostics', heartRate: 79, fatigueScore: 30, ppeCompliant: true },
];
