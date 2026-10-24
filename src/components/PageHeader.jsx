import React from 'react';

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}