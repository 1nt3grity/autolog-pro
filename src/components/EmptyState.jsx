import React from 'react';

export default function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <h3 className="font-heading text-base font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}