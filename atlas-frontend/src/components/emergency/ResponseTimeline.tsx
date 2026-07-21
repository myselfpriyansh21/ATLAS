import type { Alert } from '../../lib/simulation/types';

const SEVERITY_COLOR: Record<Alert['severity'], string> = {
  info: 'var(--atlas-text-secondary)',
  warning: 'var(--atlas-warn)',
  critical: 'var(--atlas-danger)',
};

function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function ResponseTimeline({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-[var(--atlas-text-tertiary)]">No alerts yet — plant is nominal.</p>;
  }

  return (
    <ol className="relative ml-1.5 space-y-4 border-l border-white/10 pl-5">
      {alerts.slice(0, 10).map((alert) => {
        const color = SEVERITY_COLOR[alert.severity];
        return (
          <li key={alert.id} className="relative">
            <span
              className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}` }}
            />
            <p className="text-sm text-[var(--atlas-text-primary)]">{alert.message}</p>
            <p className="text-xs text-[var(--atlas-text-tertiary)]">{relativeTime(alert.timestamp)}</p>
          </li>
        );
      })}
    </ol>
  );
}