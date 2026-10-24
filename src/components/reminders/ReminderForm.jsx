import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { REMINDER_TYPE_OPTIONS, toDateInput } from '@/lib/carUtils';
import { numberOrUndefined, textOrUndefined } from '@/lib/formUtils';

const EMPTY = { title: '', type: 'maintenance', due_date: '', due_mileage: '', priority: 'medium', notes: '' };

export default function ReminderForm({ open, onOpenChange, vehicle, reminder, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (reminder) {
      setForm({
        title: reminder.title || '',
        type: reminder.type || 'maintenance',
        due_date: toDateInput(reminder.due_date),
        due_mileage: reminder.due_mileage ?? '',
        priority: reminder.priority || 'medium',
        notes: reminder.notes || ''
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, reminder]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast({ title: 'Name this upcoming item', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      vehicle_id: vehicle.id,
      title: form.title.trim(),
      type: form.type,
      due_date: textOrUndefined(form.due_date),
      due_mileage: numberOrUndefined(form.due_mileage),
      priority: form.priority,
      notes: textOrUndefined(form.notes)
    };
    try {
      if (reminder?.id) {
        await base44.entities.Reminder.update(reminder.id, payload);
        toast({ title: 'Upcoming item updated' });
      } else {
        await base44.entities.Reminder.create({ ...payload, status: 'pending' });
        toast({ title: 'Added to what is coming up' });
      }
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit upcoming item' : 'Add something to look after'}</DialogTitle>
          <DialogDescription>{vehicle?.nickname} — a date, a mileage, or both.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="rtitle">What needs looking at *</Label>
            <Input id="rtitle" value={form.title} onChange={set('title')} placeholder="Brake fluid flush" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={setValue('type')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={setValue('priority')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rdue">Due date</Label>
              <Input id="rdue" type="date" value={form.due_date} onChange={set('due_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rmileage">Or at mileage</Label>
              <Input id="rmileage" type="number" value={form.due_mileage} onChange={set('due_mileage')} placeholder="95000" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rnotes">Notes</Label>
            <Textarea id="rnotes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Anything to remember when this comes up." />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : reminder ? 'Save changes' : 'Add item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}