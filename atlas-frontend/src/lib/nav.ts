import {
  LayoutGrid,
  Boxes,
  Radar,
  Users2,
  ShieldAlert,
  BookOpenText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  description: string;
  status: 'live' | 'building';
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Overview',
    icon: LayoutGrid,
    description: 'Plant health at a glance',
    status: 'live',
  },
 {
    path: '/digital-twin',
    label: 'Digital Twin',
    icon: Boxes,
    description: 'Live interactive plant model',
    status: 'live',
  },
  {
    path: '/predictive-engine',
    label: 'Predictive Engine',
    icon: Radar,
    description: 'RUL, risk & anomaly ML',
    status: 'live',
  },
  {
    path: '/ai-council',
    label: 'AI Council',
    icon: Users2,
    description: 'Multi-expert reasoning',
    status: 'live',
  },
  {
    path: '/emergency-response',
    label: 'Emergency Response',
    icon: ShieldAlert,
    description: 'Heatmap, evacuation & alerts',
    status: 'live',
  },
  {
    path: '/knowledge-center',
    label: 'Knowledge Center',
    icon: BookOpenText,
    description: 'RAG over your documents',
    status: 'live',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account & preferences',
    status: 'live',
  },
];
