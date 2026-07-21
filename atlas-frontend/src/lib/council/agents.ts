import {
  ShieldCheck,
  Wrench,
  FlaskConical,
  Hammer,
  ClipboardCheck,
  Siren,
  type LucideIcon,
} from 'lucide-react';
import type { Asset, Worker, Zone } from '../simulation/types';

export type Severity = 'info' | 'caution' | 'warning' | 'critical';

export interface AgentFinding {
  agentId: string;
  agentName: string;
  role: string;
  icon: LucideIcon;
  message: string;
  severity: Severity;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function ratio(value: number | undefined, safeMax: number | undefined) {
  if (value === undefined || safeMax === undefined || safeMax === 0) return 0;
  return value / safeMax;
}

function severityFromRatio(r: number): Severity {
  if (r >= 1.3) return 'critical';
  if (r >= 1.0) return 'warning';
  if (r >= 0.75) return 'caution';
  return 'info';
}

interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  icon: LucideIcon;
  analyze: (ctx: {
    asset: Asset;
    zone: Zone | undefined;
    workersInZone: Worker[];
  }) => Omit<AgentFinding, 'agentId' | 'agentName' | 'role' | 'icon'>;
}

const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'safety',
    name: 'Safety Engineer AI',
    role: 'Personnel exposure & risk',
    icon: ShieldCheck,
    analyze: ({ asset, zone, workersInZone }) => {
      const nonCompliant = workersInZone.filter((w) => !w.ppeCompliant).length;
      if (asset.status === 'critical' && workersInZone.length > 0) {
        return {
          message: `${workersInZone.length} worker(s) currently present in ${zone?.name ?? 'this zone'} while ${asset.name} is at critical risk. Immediate evacuation recommended.`,
          severity: 'critical',
        };
      }
      if (nonCompliant > 0) {
        return {
          message: `${nonCompliant} worker(s) in ${zone?.name ?? 'this zone'} flagged as non-PPE-compliant. Recommend addressing before risk escalates further.`,
          severity: 'warning',
        };
      }
      if (asset.status === 'warning') {
        return {
          message: `${workersInZone.length} worker(s) nearby ${asset.name}. Exposure is currently manageable but should be monitored as risk trends upward.`,
          severity: 'caution',
        };
      }
      return {
        message: `No elevated personnel exposure risk detected near ${asset.name}. PPE compliance nominal.`,
        severity: 'info',
      };
    },
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineer AI',
    role: 'Vibration, temperature & structural wear',
    icon: Wrench,
    analyze: ({ asset }) => {
      const vibRatio = ratio(asset.metrics.vibration, asset.thresholds.vibration?.safeMax);
      const tempRatio = ratio(asset.metrics.temperature, asset.thresholds.temperature?.safeMax);
      const worst = Math.max(vibRatio, tempRatio);
      const severity = severityFromRatio(worst);
      if (severity === 'critical') {
        return {
          message: `Vibration at ${asset.metrics.vibration.toFixed(1)} mm/s combined with elevated temperature is consistent with bearing failure or shaft misalignment. Mechanical failure likely imminent.`,
          severity,
        };
      }
      if (severity === 'warning' || severity === 'caution') {
        return {
          message: `Vibration and thermal readings on ${asset.name} are trending above nominal — early signature of mechanical wear. Recommend physical inspection.`,
          severity,
        };
      }
      return {
        message: `Vibration and thermal signatures on ${asset.name} are within normal mechanical tolerances.`,
        severity: 'info',
      };
    },
  },
  {
    id: 'chemical',
    name: 'Chemical Engineer AI',
    role: 'Gas concentration & process chemistry',
    icon: FlaskConical,
    analyze: ({ asset }) => {
      if (asset.metrics.gasConcentration === undefined) {
        return {
          message: `${asset.name} has no chemical process sensors — deferring to mechanical and thermal indicators for this asset.`,
          severity: 'info',
        };
      }
      const gasRatio = ratio(asset.metrics.gasConcentration, asset.thresholds.gasConcentration?.safeMax);
      const severity = severityFromRatio(gasRatio);
      if (severity === 'critical') {
        return {
          message: `Gas concentration at ${asset.metrics.gasConcentration.toFixed(1)} ppm is well above safe limits — strong indicator of a developing leak or seal failure.`,
          severity,
        };
      }
      if (severity === 'warning' || severity === 'caution') {
        return {
          message: `Gas concentration near ${asset.name} is rising above baseline. Recommend ventilation check and seal inspection.`,
          severity,
        };
      }
      return {
        message: `Gas concentration near ${asset.name} is within safe limits.`,
        severity: 'info',
      };
    },
  },
  {
    id: 'maintenance',
    name: 'Maintenance Engineer AI',
    role: 'Remaining useful life & service history',
    icon: Hammer,
    analyze: ({ asset }) => {
      const daysSinceMaintenance = Math.round(
        (Date.now() - new Date(asset.lastMaintenance).getTime()) / 86_400_000
      );
      if (asset.remainingUsefulLifeDays <= 2) {
        return {
          message: `Predicted remaining useful life for ${asset.name} has fallen to ${asset.remainingUsefulLifeDays} day(s). Last serviced ${daysSinceMaintenance} days ago — overdue for intervention.`,
          severity: 'critical',
        };
      }
      if (asset.remainingUsefulLifeDays <= 15) {
        return {
          message: `${asset.name}'s remaining useful life is trending down (${asset.remainingUsefulLifeDays} days). Recommend scheduling maintenance within the week.`,
          severity: 'warning',
        };
      }
      return {
        message: `${asset.name} maintenance schedule is on track — last serviced ${daysSinceMaintenance} days ago, ${asset.remainingUsefulLifeDays} days of estimated life remaining.`,
        severity: 'info',
      };
    },
  },
  {
    id: 'compliance',
    name: 'Compliance Officer AI',
    role: 'Occupancy & safety protocol adherence',
    icon: ClipboardCheck,
    analyze: ({ zone, workersInZone }) => {
      if (!zone) {
        return { message: 'No zone data available for compliance review.', severity: 'info' };
      }
      if (zone.riskLevel === 'red' && workersInZone.length > 0) {
        return {
          message: `${workersInZone.length} worker(s) present in ${zone.name}, which exceeds recommended occupancy limits for a zone at red risk level under standard industrial safety protocol.`,
          severity: 'critical',
        };
      }
      if (zone.riskLevel === 'orange' && workersInZone.length > 0) {
        return {
          message: `${zone.name} is at orange risk with personnel present. Recommend restricting to essential personnel only until risk subsides.`,
          severity: 'warning',
        };
      }
      return {
        message: `${zone.name} is currently within acceptable occupancy and safety protocol limits.`,
        severity: 'info',
      };
    },
  },
  {
    id: 'emergency',
    name: 'Emergency Response AI',
    role: 'Incident escalation & response posture',
    icon: Siren,
    analyze: ({ asset, zone }) => {
      if (asset.status === 'critical') {
        return {
          message: `Recommend placing emergency response team on standby and pre-staging evacuation routes for ${zone?.name ?? 'the affected zone'}.`,
          severity: 'critical',
        };
      }
      if (asset.status === 'warning') {
        return {
          message: `No active emergency posture required yet, but recommend notifying the on-shift response team of elevated risk near ${asset.name}.`,
          severity: 'caution',
        };
      }
      return {
        message: 'No emergency escalation required at this time.',
        severity: 'info',
      };
    },
  },
];

export function runCouncilAnalysis(
  asset: Asset,
  zone: Zone | undefined,
  workersInZone: Worker[]
): AgentFinding[] {
  return AGENT_DEFINITIONS.map((agent) => {
    const result = agent.analyze({ asset, zone, workersInZone });
    return {
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      icon: agent.icon,
      ...result,
    };
  });
}

export { clamp };