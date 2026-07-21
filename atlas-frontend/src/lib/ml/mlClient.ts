const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

export type RiskClass = 'normal' | 'warning' | 'critical';

export interface PredictAllResponse {
  asset_id: string | null;
  asset_name: string | null;
  rul: { remaining_useful_life_days: number };
  risk: { risk_class: RiskClass; probabilities: Record<string, number> };
  anomaly: { is_anomaly: boolean; anomaly_score: number; threshold: number };
}

export async function predictAll(
  features: number[],
  assetId: string,
  assetName: string
): Promise<PredictAllResponse> {
  const res = await fetch(`${ML_SERVICE_URL}/predict-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features, asset_id: assetId, asset_name: assetName }),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`ML service error: ${res.status}`);
  return res.json();
}

export async function checkMlServiceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.models_loaded === true;
  } catch {
    return false;
  }
}

export { ML_SERVICE_URL };