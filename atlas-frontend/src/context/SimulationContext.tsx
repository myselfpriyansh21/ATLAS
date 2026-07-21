import { useSyncExternalStore } from 'react';
import { simulationEngine } from '../lib/simulation/engine';
import type { SimulationSnapshot } from '../lib/simulation/types';

/**
 * Subscribes the calling component to the live simulation engine.
 * The engine itself is a module-level singleton (see lib/simulation/engine.ts)
 * so every component calling this hook shares the exact same live state —
 * no prop drilling, no duplicate intervals.
 *
 * The engine starts ticking automatically the moment the first component
 * subscribes, and stops when the last one unmounts.
 */
export function useSimulation(): SimulationSnapshot {
  return useSyncExternalStore(simulationEngine.subscribe, simulationEngine.getSnapshot);
}

export function useSimulationControls() {
  return {
    triggerScenario: simulationEngine.triggerScenario,
    resolveScenario: simulationEngine.resolveScenario,
    resetSimulation: simulationEngine.resetSimulation,
  };
}
