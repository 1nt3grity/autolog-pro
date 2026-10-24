import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { SEVERITY_META } from '@/lib/symptoms';
import { getSymptomIcon } from '@/components/diagnostics/symptomIcons';

export default function ChecklistRunner({ open, onOpenChange, vehicle, symptom, existingRun, onSaved }) {
  const { toast } = useToast();
  const [steps, setSteps] = useState([]);
  const [findings, setFindings] = useState('');
  const [runId, setRunId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !symptom) return;
    const saved = existingRun?.steps?.length ? existingRun.steps : null;
    setSteps(saved || symptom.steps.map((label) => ({ label, checked: false })));
    setFindings(existingRun?.findings || '');
    setRunId(existingRun?.id || null);
  }, [open, symptom, existingRun]);

  if (!symptom) return null;

  const Icon = getSymptomIcon(symptom.icon);
  const checkedCount = steps.filter((step) => step.checked).length;
  const progress = steps.length ? Math.round((checkedCount / steps.length) * 100) : 0;
  const severity = SEVERITY_META[symptom.severity] || SEVERITY_META.low;

  const toggleStep = (index) =>
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, checked: !step.checked } : step)));

  const persist = async (status) => {
    if (!vehicle) return;
    setSaving(true);
    const payload = {
      vehicle_id: vehicle.id,
      symptom_id: symptom.id,
      symptom_name: symptom.name,
      category: symptom.category,
      severity: symptom.severity,
      steps,
      findings: findings.trim() || undefined,
      status
    };
    try {
      if (runId) {
        await base44.entities.DiagnosticRun.update(runId, payload);
      } else {
        const created = await base44.entities.DiagnosticRun.create(payload);
        setRunId(created.id);
      }
      toast({
        title:
          status === 'in_progress' ? 'Progress saved' : status === 'resolved' ? 'Marked as resolved' : 'Saved as needs a shop'
      });
      onSaved?.();
      if (status !== 'in_progress') onOpenChange(false);
    } catch (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-left leading-snug">{symptom.name}</DialogTitle>
              <DialogDescription className="text-left">
                {vehicle ? `${vehicle.nickname} — work through each step and save as you go.` : 'Choose a vehicle first.'}
              </DialogDescription>
              <span className={cn('inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide', severity.tone)}>
                {severity.label}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-1">
          <p className="text-sm leading-relaxed text-muted-foreground">{symptom.summary}</p>

          <section className="space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Likely causes</h3>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {symptom.causes.map((cause) => (
                <li key={cause} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {cause}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Checklist</h3>
              <span className="num text-xs text-muted-foreground">
                {checkedCount} / {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <ul className="space-y-1.5">
              {steps.map((step, index) => (
                <li key={`${step.label}-${index}`}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-200',
                      step.checked ? 'border-emerald-200 bg-emerald-50/60' : 'border-border/70 bg-card hover:border-border hover:bg-secondary/40'
                    )}
                  >
                    <Checkbox checked={step.checked} onCheckedChange={() => toggleStep(index)} className="mt-0.5" />
                    <span className={cn('leading-relaxed', step.checked && 'text-muted-foreground line-through')}>{step.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {symptom.red_flag && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="text-sm leading-relaxed text-red-800">{symptom.red_flag}</p>
            </div>
          )}

          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you found</h3>
            <Textarea
              rows={3}
              value={findings}
              onChange={(event) => setFindings(event.target.value)}
              placeholder="Note the readings, sounds, or parts you checked so you have it later."
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Saved checks stay on the Saved runs tab until you mark them resolved.
            </p>
          </section>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="button" variant="outline" disabled={saving || !vehicle} onClick={() => persist('unresolved')}>
              Needs a shop
            </Button>
            <Button type="button" variant="secondary" disabled={saving || !vehicle} onClick={() => persist('in_progress')}>
              Save progress
            </Button>
            <Button type="button" disabled={saving || !vehicle} onClick={() => persist('resolved')}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Mark resolved
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}