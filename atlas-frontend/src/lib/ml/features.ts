import type { Asset } from '../simulation/types';

/**
 * Converts an asset's live metrics into the 4-number feature vector the
 * ML service expects: [temp_ratio, pressure_ratio, vibration_ratio, gas_ratio]
 *
 * Each ratio = current value / that metric's "safe max" threshold.
 * A ratio of 1.0 means "right at the safe limit". If an asset has no
 * threshold for a channel (e.g. a tank has no vibration threshold), the
 * ratio is 0 — this matches exactly how the Python training data
 * generates "missing sensor" channels, so the model handles it correctly.
 */
export function computeAssetFeatures(asset: Asset): number[] {
  const ratio = (value: number | undefined, safeMax: number | undefined) => {
    if (value === undefined || safeMax === undefined || safeMax === 0) return 0;
    return value / safeMax;
  };

  return [
    ratio(asset.metrics.temperature, asset.thresholds.temperature?.safeMax),
    ratio(asset.metrics.pressure, asset.thresholds.pressure?.safeMax),
    ratio(asset.metrics.vibration, asset.thresholds.vibration?.safeMax),
    ratio(asset.metrics.gasConcentration, asset.thresholds.gasConcentration?.safeMax),
  ];
}

export const FEATURE_LABELS = ['Temperature', 'Pressure', 'Vibration', 'Gas Concentration'];