import type { Asset } from '../simulation/types';
import type { AgentFinding } from './agents';
import { clamp } from './agents';

export interface ConsensusResult {
  action: string;
  confidence: number;
  basis: string;
}

export function buildConsensus(
  asset: Asset,
  zoneName: string,
  findings: AgentFinding[]
): ConsensusResult {
  const concernCount = findings.filter((f) => f.severity === 'warning' || f.severity === 'critical').length;
  const total = findings.length;

  let action: string;
  let confidence: number;

  if (asset.status === 'critical') {
    action = `Shut down ${asset.name} immediately and evacuate non-essential personnel from ${zoneName}.`;
    confidence = Math.round(clamp(80 + asset.riskScore * 0.18, 80, 99));
  } else if (asset.status === 'warning') {
    action = `Schedule immediate inspection of ${asset.name} and restrict non-essential access to ${zoneName}.`;
    confidence = Math.round(clamp(60 + asset.riskScore * 0.35, 60, 92));
  } else {
    action = `Continue standard monitoring of ${asset.name}. No immediate action required.`;
    confidence = Math.round(clamp(90 + (100 - asset.riskScore) * 0.05, 90, 99));
  }

  return {
    action,
    confidence,
    basis: `${concernCount} of ${total} council members flagged elevated concern`,
  };
}