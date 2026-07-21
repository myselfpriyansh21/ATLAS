import type {
  Asset,
  AssetMetrics,
  Alert,
  AlertSeverity,
  ScenarioState,
  SimulationSnapshot,
  Worker,
  Zone,
  RiskLevel,
} from './types';
import { INITIAL_ASSETS, INITIAL_WORKERS, ZONES } from './seedData';

const TICK_MS = 2000;
const SIM_MINUTES_PER_TICK = 1; // during an active scenario, 1 tick = 1 simulated minute
const MAX_ALERTS = 30;
const PUMP17_ID = 'pump-17';
const ETA_TO_FAILURE_MINUTES = 38; // matches the reference demo scenario

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Smooth accelerating ramp: slow onset, rapid near the end — reads as
// plausible degradation rather than a linear countdown.
function rampProgress(simMinutes: number, etaMinutes: number) {
  const t = clamp(simMinutes / etaMinutes, 0, 1.2);
  return Math.pow(t, 1.6);
}

function deviationForMetric(
  value: number,
  thresholds: { safeMax: number; criticalMax: number } | undefined
): number {
  if (!thresholds) return 0;
  if (value <= thresholds.safeMax) return 0;
  return clamp((value - thresholds.safeMax) / (thresholds.criticalMax - thresholds.safeMax), 0, 1);
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'red';
  if (score >= 50) return 'orange';
  if (score >= 25) return 'yellow';
  return 'green';
}

type Listener = () => void;

class SimulationEngine {
  private assets: Map<string, Asset>;
  private workers: Map<string, Worker>;
  private zoneMeta = ZONES;
  private alerts: Alert[] = [];
  private listeners: Set<Listener> = new Set();
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private scenario: ScenarioState = {
    name: null,
    phase: 'idle',
    startedAt: null,
    simulatedMinutes: 0,
    etaToFailureMinutes: ETA_TO_FAILURE_MINUTES,
  };
  private cachedSnapshot: SimulationSnapshot | null = null;
  private workersRelocated = false;

  constructor() {
    this.assets = new Map(INITIAL_ASSETS.map((a) => [a.id, structuredClone(a)]));
    this.workers = new Map(INITIAL_WORKERS.map((w) => [w.id, structuredClone(w)]));
    this.recompute();
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  };

  getSnapshot = (): SimulationSnapshot => {
    if (!this.cachedSnapshot) this.recompute();
    return this.cachedSnapshot!;
  };

  private start() {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => this.tick(), TICK_MS);
  }

  private stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private pushAlert(severity: AlertSeverity, message: string, assetId?: string, zoneId?: string) {
    this.alerts.unshift({
      id: nextId('alert'),
      timestamp: Date.now(),
      severity,
      message,
      assetId,
      zoneId,
    });
    if (this.alerts.length > MAX_ALERTS) this.alerts.length = MAX_ALERTS;
  }

  // ── Public scenario controls ──────────────────────────────
  triggerScenario = () => {
    if (this.scenario.phase !== 'idle' && this.scenario.phase !== 'resolved') return;
    this.scenario = {
      name: 'pump17-overheat',
      phase: 'degrading',
      startedAt: Date.now(),
      simulatedMinutes: 0,
      etaToFailureMinutes: ETA_TO_FAILURE_MINUTES,
    };
    this.workersRelocated = false;
    this.pushAlert('warning', 'Pump-17 vibration trending above threshold', PUMP17_ID, 'zone-c');
    this.notify();
  };

  resolveScenario = () => {
    if (this.scenario.phase === 'idle') return;
    this.scenario = { ...this.scenario, phase: 'intervening' };
    this.pushAlert('info', 'Operator intervention initiated — shutting down Pump-17 and rerouting production', PUMP17_ID, 'zone-c');
    this.notify();
  };

  resetSimulation = () => {
    this.assets = new Map(INITIAL_ASSETS.map((a) => [a.id, structuredClone(a)]));
    this.workers = new Map(INITIAL_WORKERS.map((w) => [w.id, structuredClone(w)]));
    this.alerts = [];
    this.scenario = {
      name: null,
      phase: 'idle',
      startedAt: null,
      simulatedMinutes: 0,
      etaToFailureMinutes: ETA_TO_FAILURE_MINUTES,
    };
    this.workersRelocated = false;
    this.recompute();
    this.notify();
  };

  // ── Tick loop ──────────────────────────────────────────────
  private tick() {
    this.tickCount += 1;

    if (this.scenario.phase === 'degrading' || this.scenario.phase === 'critical') {
      this.scenario.simulatedMinutes += SIM_MINUTES_PER_TICK;
      this.applyPump17Scenario();
    } else if (this.scenario.phase === 'intervening') {
      this.applyIntervention();
    } else {
      this.driftAllAssetsToBaseline();
    }

    this.recompute();
    this.notify();
  }

  private driftAllAssetsToBaseline() {
    this.assets.forEach((asset) => {
      const next: AssetMetrics = { ...asset.metrics };
      (Object.keys(asset.baseline) as (keyof AssetMetrics)[]).forEach((key) => {
        const base = asset.baseline[key] ?? 0;
        const current = asset.metrics[key] ?? base;
        const noise = (Math.random() - 0.5) * (base * 0.02 + 0.05);
        next[key] = current + (base - current) * 0.15 + noise;
      });
      asset.metrics = next;
    });
  }

  private applyPump17Scenario() {
    // Gentle ambient drift for every other asset
    this.assets.forEach((asset) => {
      if (asset.id === PUMP17_ID) return;
      const next: AssetMetrics = { ...asset.metrics };
      (Object.keys(asset.baseline) as (keyof AssetMetrics)[]).forEach((key) => {
        const base = asset.baseline[key] ?? 0;
        const current = asset.metrics[key] ?? base;
        const noise = (Math.random() - 0.5) * (base * 0.015 + 0.03);
        next[key] = current + (base - current) * 0.2 + noise;
      });
      asset.metrics = next;
    });

    const pump = this.assets.get(PUMP17_ID)!;
    const progress = rampProgress(this.scenario.simulatedMinutes, this.scenario.etaToFailureMinutes);
    const t = pump.thresholds;

    pump.metrics = {
      temperature: pump.baseline.temperature + ((t.temperature?.criticalMax ?? 130) - pump.baseline.temperature) * progress,
      pressure: pump.baseline.pressure + ((t.pressure?.criticalMax ?? 9.5) - pump.baseline.pressure) * progress,
      vibration: pump.baseline.vibration + ((t.vibration?.criticalMax ?? 9) - pump.baseline.vibration) * progress,
      powerConsumption: pump.baseline.powerConsumption * (1 + progress * 0.4),
      gasConcentration:
        (pump.baseline.gasConcentration ?? 8) +
        ((t.gasConcentration?.criticalMax ?? 80) - (pump.baseline.gasConcentration ?? 8)) * progress,
    };

    const mins = this.scenario.simulatedMinutes;

    // Milestone: workers move into the affected zone
    if (mins >= 5 && !this.workersRelocated) {
      this.workersRelocated = true;
      const worker = this.workers.get('w-5');
      if (worker) worker.zoneId = 'zone-c';
      this.pushAlert(
        'warning',
        'Worker P. Singh entered Zone C — 3 workers now present near Pump-17',
        PUMP17_ID,
        'zone-c'
      );
    }

    if (mins >= 15 && mins < 16) {
      this.pushAlert('warning', 'Gas concentration rising in Zone C', PUMP17_ID, 'zone-c');
    }

    if (mins >= 25 && this.scenario.phase !== 'critical') {
      this.scenario.phase = 'critical';
      this.pushAlert(
        'critical',
        'Pump-17 risk score critical — predicted failure imminent',
        PUMP17_ID,
        'zone-c'
      );
    }

    if (mins >= this.scenario.etaToFailureMinutes && mins < this.scenario.etaToFailureMinutes + SIM_MINUTES_PER_TICK) {
      this.pushAlert(
        'critical',
        `Predicted failure window reached (T+${mins}min) — immediate intervention required`,
        PUMP17_ID,
        'zone-c'
      );
    }
  }

  private applyIntervention() {
    const pump = this.assets.get(PUMP17_ID)!;
    const next: AssetMetrics = { ...pump.metrics };
    (Object.keys(pump.baseline) as (keyof AssetMetrics)[]).forEach((key) => {
      const base = pump.baseline[key] ?? 0;
      const current = pump.metrics[key] ?? base;
      next[key] = current + (base - current) * 0.25;
    });
    pump.metrics = next;

    // Ambient drift for everyone else
    this.assets.forEach((asset) => {
      if (asset.id === PUMP17_ID) return;
      const nextOther: AssetMetrics = { ...asset.metrics };
      (Object.keys(asset.baseline) as (keyof AssetMetrics)[]).forEach((key) => {
        const base = asset.baseline[key] ?? 0;
        const current = asset.metrics[key] ?? base;
        nextOther[key] = current + (base - current) * 0.2;
      });
      asset.metrics = nextOther;
    });

    const isBackToBaseline =
      Math.abs(pump.metrics.temperature - pump.baseline.temperature) < 1.5 &&
      Math.abs(pump.metrics.vibration - pump.baseline.vibration) < 0.2;

    if (isBackToBaseline) {
      this.scenario.phase = 'resolved';
      const worker = this.workers.get('w-5');
      if (worker) worker.zoneId = 'zone-a';
      this.pushAlert('info', 'Pump-17 safely shut down. Incident averted — plant returning to nominal.', PUMP17_ID, 'zone-c');
    }
  }

  // ── Derived state ──────────────────────────────────────────
  private recompute() {
    const assetsArr: Asset[] = [];
    this.assets.forEach((asset) => {
      const devs = (Object.keys(asset.metrics) as (keyof AssetMetrics)[])
        .filter((k) => asset.metrics[k] !== undefined)
        .map((k) => deviationForMetric(asset.metrics[k]!, asset.thresholds[k]));
      const maxDev = devs.length ? Math.max(...devs) : 0;
      const avgDev = devs.length ? devs.reduce((a, b) => a + b, 0) / devs.length : 0;
      const riskScore = Math.round(100 * (0.7 * maxDev + 0.3 * avgDev));
      const healthScore = clamp(100 - riskScore, 0, 100);
      const status = riskScore >= 70 ? 'critical' : riskScore >= 30 ? 'warning' : 'normal';

      // RUL erodes as risk climbs, recovers as risk falls (bounded)
      const rulTarget = asset.id === PUMP17_ID ? clamp(6 - riskScore / 12, 0.2, 6) : asset.remainingUsefulLifeDays;

      assetsArr.push({
        ...asset,
        riskScore,
        healthScore,
        status,
        remainingUsefulLifeDays: asset.id === PUMP17_ID ? Math.round(rulTarget * 10) / 10 : asset.remainingUsefulLifeDays,
      });
    });

    const workersArr = Array.from(this.workers.values()).map((w) => ({ ...w }));

    const zonesArr: Zone[] = this.zoneMeta.map((zoneMeta) => {
      const zoneAssets = assetsArr.filter((a) => a.zoneId === zoneMeta.id);
      const zoneWorkerCount = workersArr.filter((w) => w.zoneId === zoneMeta.id).length;
      const worstAssetRisk = zoneAssets.length ? Math.max(...zoneAssets.map((a) => a.riskScore)) : 0;
      const workerFactor = worstAssetRisk > 40 ? Math.min(zoneWorkerCount * 4, 15) : 0;
      const riskScore = clamp(worstAssetRisk + workerFactor, 0, 100);
      return {
        ...zoneMeta,
        riskScore,
        riskLevel: riskLevelFromScore(riskScore),
      };
    });

    const plantHealth = Math.round(
      assetsArr.reduce((sum, a) => sum + a.healthScore, 0) / assetsArr.length
    );

    const maxZoneRisk = Math.max(...zonesArr.map((z) => z.riskScore), 0);
    const avgAssetRisk = assetsArr.reduce((sum, a) => sum + a.riskScore, 0) / assetsArr.length;
    const safetyScore = Math.round(clamp(100 - maxZoneRisk * 0.5 - avgAssetRisk * 0.3, 0, 100));

    this.cachedSnapshot = {
      assets: assetsArr,
      workers: workersArr,
      zones: zonesArr,
      alerts: [...this.alerts],
      plantHealth,
      safetyScore,
      scenario: { ...this.scenario },
      tickCount: this.tickCount,
    };
  }
}

export const simulationEngine = new SimulationEngine();
