import {
  Droplet,
  Flame,
  Fan,
  Database,
  Gauge,
  Zap,
  Cog,
  ToggleLeft,
  Route,
  Package,
  Monitor,
  type LucideIcon,
} from 'lucide-react';
import type { AssetType, AssetStatus, RiskLevel } from './types';

export const ASSET_ICON: Record<AssetType, LucideIcon> = {
  pump: Droplet,
  boiler: Flame,
  coolingTower: Fan,
  tank: Database,
  compressor: Gauge,
  generator: Zap,
  motor: Cog,
  valve: ToggleLeft,
  pipeline: Route,
  warehouse: Package,
  controlRoom: Monitor,
};

export const STATUS_COLOR: Record<AssetStatus, string> = {
  normal: 'var(--atlas-safe)',
  warning: 'var(--atlas-warn)',
  critical: 'var(--atlas-danger)',
};

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  green: 'var(--atlas-safe)',
  yellow: 'var(--atlas-warn)',
  orange: '#f2854a',
  red: 'var(--atlas-danger)',
};