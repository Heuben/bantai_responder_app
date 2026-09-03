import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';

export type StatTone = 'primary' | 'success' | 'danger' | 'urgent' | 'accent' | 'cyan' | 'violet' | 'neutral';

type StatTileProps = {
  /** Small uppercase eyebrow label above the value. */
  label: string;
  /** Big numeric / text value. */
  value: string;
  /** Optional unit (e.g. "km", "min", "%"). */
  unit?: string;
  /** Optional one-line caption below the value. */
  caption?: string;
  /** Tone drives the accent color and the icon chip background. */
  tone?: StatTone;
  /** Decorative / leading icon. */
  icon?: React.ReactNode;
  /** Optional onClick — adds chevron + tap feedback. */
  onClick?: () => void;
  className?: string;
};

const toneToBg: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  urgent: 'bg-urgent/15 text-urgent',
  accent: 'bg-accent/12 text-accent',
  cyan: 'bg-cyan/12 text-cyan',
  violet: 'bg-violet/12 text-violet',
  neutral: 'bg-raised text-muted',
};

const toneToRing: Record<StatTone, string> = {
  primary: 'ring-primary/15',
  success: 'ring-success/15',
  danger: 'ring-danger/15',
  urgent: 'ring-urgent/20',
  accent: 'ring-accent/20',
  cyan: 'ring-cyan/20',
  violet: 'ring-violet/20',
  neutral: 'ring-line',
};

/**
 * Bold, compact data tile — mirrors the inspiration's "KPI" cards.
 * Big tabular-num value, uppercase label, and a tone-tinted icon chip.
 */
export function StatTile({
  label,
  value,
  unit,
  caption,
  tone = 'primary',
  icon,
  onClick,
  className = '',
}: StatTileProps) {
  const Comp: React.ElementType = onClick ? motion.button : 'div';
  return (
    <Comp
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className={`relative flex w-full flex-col items-start gap-1.5 overflow-hidden rounded-2xl border border-line bg-surface p-4 text-left shadow-card ${toneToRing[tone]} ${className}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${toneToBg[tone]}`}
        >
          {icon}
        </span>
        {onClick && <ChevronRightIcon size={16} className="text-muted" strokeWidth={2.4} />}
      </div>
      <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="flex items-baseline gap-1 leading-none">
        <span className="text-[26px] font-extrabold tracking-[-0.03em] tabular-nums text-ink">
          {value}
        </span>
        {unit && <span className="text-[13px] font-semibold text-muted">{unit}</span>}
      </p>
      {caption && (
        <p className="text-[12px] leading-snug text-muted">{caption}</p>
      )}
    </Comp>
  );
}
