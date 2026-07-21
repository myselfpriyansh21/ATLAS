interface VitalsWaveformProps {
  status?: 'nominal' | 'warning' | 'critical';
}

// A heartbeat-style waveform representing overall plant health.
// The plant is treated like a patient under continuous watch —
// this is ATLAS's one deliberate signature motif, used only here.
export function VitalsWaveform({ status = 'nominal' }: VitalsWaveformProps) {
  const color =
    status === 'critical' ? 'var(--atlas-danger)' : status === 'warning' ? 'var(--atlas-warn)' : 'var(--atlas-accent)';

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-32 overflow-hidden">
        <svg viewBox="0 0 200 40" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M0,20 L40,20 L48,20 L54,6 L62,34 L70,20 L82,20 L200,20"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
            className="vitals-path"
          />
        </svg>
      </div>
      <span
        className="mono-data text-xs uppercase tracking-wider"
        style={{ color }}
      >
        {status}
      </span>
      <style>{`
        .vitals-path {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: vitals-draw 2.4s ease-in-out infinite;
        }
        @keyframes vitals-draw {
          0% { stroke-dashoffset: 320; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -320; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vitals-path { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
