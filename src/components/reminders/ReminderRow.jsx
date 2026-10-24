import React from 'react';
import { Bell, Check, Clock, Pencil, ShieldCheck, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { dueLabel, formatMiles, isOverdue, REMINDER_TYPE_LABELS } from '@/lib/carUtils';

const PRIORITY_DOT = {
  high: 'bg-destructive',
  medium: 'bg-primary',
  low: 'bg-muted-foreground/50'
};

export default function ReminderRow({ reminder, onChanged, onEdit, showVehicle, vehicleName }) {
  const { toast } = useToast();
  const overdue = reminder.status === 'pending' && isOverdue(reminder);
  const done = reminder.status === 'completed';
  const dismissed = reminder.status === 'dismissed';

  const setStatus = async (status) => {
    await base44.entities.Reminder.update(reminder.id, {
      status,
      completed_date: status === 'completed' ? new Date().toISOString().slice(0, 10) : undefined
    });
    toast({ title: status === 'completed' ? 'Marked as done' : status === 'dismissed' ? 'Dismissed' : 'Updated' });
    onChanged?.();
  };

  const handleDelete = async () => {
    await base44.entities.Reminder.delete(reminder.id);
    toast({ title: 'Removed' });
    onChanged?.();
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between',
        overdue ? 'border-destructive/40 bg-destructive/[0.03]' : 'border-border/70',
        (done || dismissed) && 'opacity-60'
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[reminder.priority] || PRIORITY_DOT.medium)} />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn('font-heading text-sm font-semibold tracking-tight', done && 'line-through')}>{reminder.title}</p>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {REMINDER_TYPE_LABELS[reminder.type] || 'Other'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
            <span className={cn('flex items-center gap-1.5 font-medium', overdue && 'text-destructive')}>
              {reminder.type === 'warranty' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {reminder.status === 'pending' ? dueLabel(reminder) : done ? 'Completed' : 'Dismissed'}
            </span>
            {reminder.due_mileage !== undefined && reminder.due_mileage !== null && (
              <span className="num">{formatMiles(reminder.due_mileage)}</span>
            )}
            {showVehicle && vehicleName && <span>{vehicleName}</span>}
            {reminder.notes && <span className="truncate">{reminder.notes}</span>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        {reminder.status === 'pending' ? (
          <>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => setStatus('completed')}>
              <Check className="h-3.5 w-3.5" />
              Done
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStatus('dismissed')} aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl" onClick={() => setStatus('pending')}>
            <Bell className="h-3.5 w-3.5" />
            Reopen
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(reminder)} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}