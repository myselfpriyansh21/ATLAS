// ─────────────────────────────────────────────────────────────
// Core types for the ATLAS Simulation Engine.
// This is the single source of truth for plant state — the
// Digital Twin, Predictive Engine, AI Council, and Emergency
// Response modules will all read from a SimulationSnapshot.
// ─────────────────────────────────────────────────────────────

export type AssetType =
  | 'pump'
  | 'tank'
  | 'boiler'
  | 'coolingTower'
  | 'compressor'
  | 'generator'
  | 'motor'
  | 'valve'
  | 'pipeline'
  | 'warehouse'
  | 'controlRoom';

export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';
export type AssetStatus = 'normal' | 'warning' | 'critical';

export interface AssetMetrics {
  temperature: number; // °C
  pressure: number; // bar
  vibration: number; // mm/s
  powerConsumption: number; // kW
  gasConcentration?: number; // ppm — only relevant for a few assets
}

export interface MetricThresholds {
  safeMax: number;
  criticalMax: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  zoneId: string;
  position: { x: number; y: number }; // percent, for 2D plant layout
  metrics: AssetMetrics;
  baseline: AssetMetrics;
  thresholds: Partial<Record<keyof AssetMetrics, MetricThresholds>>;
  healthScore: number; // 0-100, higher is better
  riskScore: number; // 0-100, higher is worse
  status: AssetStatus;
  remainingUsefulLifeDays: number;
  lastMaintenance: string; // ISO date
}

export interface Worker {
  id: string;
  name: string;
  zoneId: string;
  task: string;
  heartRate: number;
  fatigueScore: number; // 0-100
  ppeCompliant: boolean;
}

export interface Zone {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number }; // percent
  riskScore: number;
  riskLevel: RiskLevel;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  message: string;
  assetId?: string;
  zoneId?: string;
}

export type ScenarioPhase =
  | 'idle'
  | 'nominal'
  | 'degrading'
  | 'critical'
  | 'intervening'
  | 'resolved';

export interface ScenarioState {
  name: 'pump17-overheat' | null;
  phase: ScenarioPhase;
  startedAt: number | null;
  simulatedMinutes: number;
  etaToFailureMinutes: number;
}

export interface SimulationSnapshot {
  assets: Asset[];
  workers: Worker[];
  zones: Zone[];
  alerts: Alert[];
  plantHealth: number;
  safetyScore: number;
  scenario: ScenarioState;
  tickCount: number;
}
