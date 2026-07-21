import type { ReactNode, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function GlassPanel({ children, hover = false, className, ...rest }: GlassPanelProps) {
  return (
    <div
      className={clsx('glass-panel', hover && 'glass-panel-hover', 'p-5', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
