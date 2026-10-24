import React from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-card text-foreground',
  primary: 'bg-primary/8 text-foreground'
};

export default function StatTile({ label, value, hint, icon: Icon, tone = 'neutral' }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-foreground/5',
        TONES[tone]
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-primary" />}
      </div>
      <p className="num mt-2.5 text-[22px] font-semibold leading-none tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}