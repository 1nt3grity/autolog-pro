import React, { useMemo, useState } from 'react';
import { Search, Play, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEVERITY_META, SYMPTOMS, SYMPTOM_CATEGORIES } from '@/lib/symptoms';
import { getSymptomIcon } from '@/components/diagnostics/symptomIcons';

export default function SymptomGrid({ onStart, mode = 'checklist', activeSymptomId }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SYMPTOMS.filter((symptom) => {
      const matchesCategory = category === 'all' || symptom.category === category;
      if (!matchesCategory) return false;
      if (!needle) return true;
      const haystack = [symptom.name, symptom.summary, ...symptom.causes].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, category]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a noise, a smell, a symptom..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200',
              category === 'all' ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
            )}
          >
            All
          </button>
          {SYMPTOM_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200',
                category === item.id ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nothing matches that search. Try a simpler word like noise, leak, or light.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((symptom) => {
            const Icon = getSymptomIcon(symptom.icon);
            const severity = SEVERITY_META[symptom.severity] || SEVERITY_META.low;
            return (
              <article
                key={symptom.id}
                className={cn(
                  'flex flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5',
                  activeSymptomId === symptom.id ? 'border-primary/50' : 'border-border/70'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide', severity.tone)}>
                    {severity.label}
                  </span>
                </div>

                <h3 className="mt-3.5 font-heading text-[15px] font-semibold leading-snug tracking-tight">{symptom.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{symptom.summary}</p>

                {mode === 'reference' && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Likely causes</p>
                    <ul className="space-y-1">
                      {symptom.causes.map((cause) => (
                        <li key={cause} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3.5">
                  <span className="num text-[11px] text-muted-foreground">{symptom.steps.length} checks</span>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => onStart(symptom)}>
                    <Play className="h-3.5 w-3.5" />
                    {mode === 'reference' ? 'Run checklist' : 'Start checklist'}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}