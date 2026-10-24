import React from 'react';
import { Calendar, History, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getSymptomIcon } from '@/components/diagnostics/symptomIcons';
import { formatDate } from '@/lib/carUtils';
import { SYMPTOMS } from '@/lib/symptoms';

const STATUS_STYLES = {
  in_progress: { label: 'In progress', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
  resolved: { label: 'Resolved', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  unresolved: { label: 'Needs a shop', tone: 'border-border bg-muted text-muted-foreground' }
};

export default function SavedRuns({ runs, vehicleNames, onResume, onDelete }) {
  if (!runs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <History className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
        <h3 className="font-heading text-base font-semibold tracking-tight">No saved checklists yet</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Start a guided checklist and save it as you go. Everything you save shows up here so you can pick it back up later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => {
        const symptom = SYMPTOMS.find((item) => item.id === run.symptom_id);
        const Icon = getSymptomIcon(symptom?.icon);
        const total = run.steps?.length || 0;
        const checked = run.steps?.filter((step) => step.checked).length || 0;
        const progress = total ? Math.round((checked / total) * 100) : 0;
        const status = STATUS_STYLES[run.status] || STATUS_STYLES.in_progress;

        return (
          <article key={run.id} className="rounded-2xl border border-border/70 bg-card p-4 transition-shadow duration-300 hover:shadow-md hover:shadow-foreground/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-semibold leading-snug tracking-tight">
                      {run.symptom_name || symptom?.name}
                    </h3>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide', status.tone)}>
                      {status.label}
                    </span>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span>{vehicleNames[run.vehicle_id] || 'Vehicle'}</span>
                    <span className="num">
                      {checked} of {total} checks done
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(run.updated_date)}
                    </span>
                  </p>
                  {run.findings && <p className="line-clamp-2 text-xs text-muted-foreground">{run.findings}</p>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => onResume(run)}>
                  <Play className="h-3.5 w-3.5" />
                  {run.status === 'in_progress' ? 'Resume' : 'Review'}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(run)} aria-label="Delete checklist">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="mt-3.5 h-1" />
          </article>
        );
      })}
    </div>
  );
}