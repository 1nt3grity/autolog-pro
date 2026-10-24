import React from 'react';
import { WARNING_LIGHT_COLORS, WARNING_LIGHTS } from '@/lib/symptoms';
import { cn } from '@/lib/utils';

const ORDER = ['red', 'amber', 'green'];

export default function WarningLights() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {ORDER.map((color) => {
          const meta = WARNING_LIGHT_COLORS[color];
          return (
            <span key={color} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
              {meta.label}
            </span>
          );
        })}
      </div>

      {ORDER.map((color) => {
        const meta = WARNING_LIGHT_COLORS[color];
        const lights = WARNING_LIGHTS.filter((light) => light.color === color);
        return (
          <section key={color} className="space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{meta.label}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {lights.map((light) => (
                <article key={light.id} className={cn('rounded-2xl border p-4', meta.tone)}>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-heading text-sm font-semibold tracking-tight">{light.name}</h4>
                    <span className="num shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      {light.urgency}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed opacity-90">{light.meaning}</p>
                  <p className="mt-2.5 text-[13px] font-medium leading-relaxed">{light.action}</p>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}