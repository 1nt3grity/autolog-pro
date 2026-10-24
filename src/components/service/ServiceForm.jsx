import React, { useEffect, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CATEGORY_OPTIONS, toDateInput } from '@/lib/carUtils';
import { arrayToParts, numberOrUndefined, partsToArray, textOrUndefined } from '@/lib/formUtils';

const EMPTY = {
  title: '',
  category: 'routine_maintenance',
  date_performed: '',
  mileage: '',
  location_name: '',
  location_address: '',
  performed_by: '',
  parts_replaced: '',
  description: '',
  cost: '',
  next_service_date: '',
  next_service_mileage: '',
  warranty_provider: '',
  warranty_months: '',
  warranty_miles: '',
  warranty_expires: '',
  warranty_notes: '',
  receipt_uri: '',
  receipt_name: ''
};

export default function ServiceForm({ open, onOpenChange, vehicle, record, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        title: record.title || '',
        category: record.category || 'routine_maintenance',
        date_performed: toDateInput(record.date_performed),
        mileage: record.mileage ?? '',
        location_name: record.location_name || '',
        location_address: record.location_address || '',
        performed_by: record.performed_by || '',
        parts_replaced: arrayToParts(record.parts_replaced),
        description: record.description || '',
        cost: record.cost ?? '',
        next_service_date: toDateInput(record.next_service_date),
        next_service_mileage: record.next_service_mileage ?? '',
        warranty_provider: record.warranty_provider || '',
        warranty_months: record.warranty_months ?? '',
        warranty_miles: record.warranty_miles ?? '',
        warranty_expires: toDateInput(record.warranty_expires),
        warranty_notes: record.warranty_notes || '',
        receipt_uri: record.receipt_uri || '',
        receipt_name: record.receipt_name || ''
      });
    } else {
      setForm({
        ...EMPTY,
        date_performed: new Date().toISOString().slice(0, 10),
        mileage: vehicle?.current_mileage !== undefined && vehicle?.current_mileage !== null ? String(vehicle.current_mileage) : ''
      });
    }
  }, [open, record, vehicle]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setValue = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((prev) => ({ ...prev, receipt_uri: file_uri, receipt_name: file.name }));
      toast({ title: 'Receipt attached' });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date_performed) {
      toast({ title: 'Add what was done and the date', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      vehicle_id: vehicle.id,
      title: form.title.trim(),
      category: form.category,
      date_performed: form.date_performed,
      mileage: numberOrUndefined(form.mileage),
      location_name: textOrUndefined(form.location_name),
      location_address: textOrUndefined(form.location_address),
      performed_by: textOrUndefined(form.performed_by),
      parts_replaced: partsToArray(form.parts_replaced),
      description: textOrUndefined(form.description),
      cost: numberOrUndefined(form.cost),
      next_service_date: textOrUndefined(form.next_service_date),
      next_service_mileage: numberOrUndefined(form.next_service_mileage),
      warranty_provider: textOrUndefined(form.warranty_provider),
      warranty_months: numberOrUndefined(form.warranty_months),
      warranty_miles: numberOrUndefined(form.warranty_miles),
      warranty_expires: textOrUndefined(form.warranty_expires),
      warranty_notes: textOrUndefined(form.warranty_notes),
      receipt_uri: textOrUndefined(form.receipt_uri),
      receipt_name: textOrUndefined(form.receipt_name)
    };

    try {
      if (record?.id) {
        await base44.entities.ServiceRecord.update(record.id, payload);
        toast({ title: 'Service record updated' });
      } else {
        const created = await base44.entities.ServiceRecord.create(payload);
        if (payload.next_service_date || payload.next_service_mileage !== undefined) {
          await base44.entities.Reminder.create({
            vehicle_id: vehicle.id,
            title: `${payload.title} — next service`,
            type: 'maintenance',
            due_date: payload.next_service_date,
            due_mileage: payload.next_service_mileage,
            priority: 'medium',
            status: 'pending',
            service_record_id: created.id
          });
        }
        toast({ title: 'Service logged' });
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
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit service record' : 'Log a service or repair'}</DialogTitle>
          <DialogDescription>
            {vehicle?.nickname} — every field is optional apart from what was done and the date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-7 pt-1">
          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What was done</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Service performed *</Label>
                <Input id="title" value={form.title} onChange={set('title')} placeholder="Oil and filter change" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={setValue('category')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date performed *</Label>
                <Input id="date" type="date" value={form.date_performed} onChange={set('date_performed')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mileage">Mileage at service</Label>
                <Input id="mileage" type="number" value={form.mileage} onChange={set('mileage')} placeholder="84500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parts">Parts replaced</Label>
                <Input id="parts" value={form.parts_replaced} onChange={set('parts_replaced')} placeholder="Oil filter, 5W-30, drain plug" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Details</Label>
                <Textarea id="description" rows={3} value={form.description} onChange={set('description')} placeholder="What was found, what was replaced, anything the shop flagged." />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Where and how much</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="location">Shop or location</Label>
                <Input id="location" value={form.location_name} onChange={set('location_name')} placeholder="Mike's Auto Service" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.location_address} onChange={set('location_address')} placeholder="120 Main St, Springfield" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="performed_by">Performed by</Label>
                <Input id="performed_by" value={form.performed_by} onChange={set('performed_by')} placeholder="Shop name or DIY" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cost">Total cost</Label>
                <Input id="cost" type="number" step="0.01" value={form.cost} onChange={set('cost')} placeholder="189.50" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Warranty on this work</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="warranty_provider">Warranty provider</Label>
                <Input id="warranty_provider" value={form.warranty_provider} onChange={set('warranty_provider')} placeholder="Parts warranty, shop warranty, manufacturer" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wmonths">Months covered</Label>
                <Input id="wmonths" type="number" value={form.warranty_months} onChange={set('warranty_months')} placeholder="24" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wmiles">Miles covered</Label>
                <Input id="wmiles" type="number" value={form.warranty_miles} onChange={set('warranty_miles')} placeholder="24000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wexpires">Expires on</Label>
                <Input id="wexpires" type="date" value={form.warranty_expires} onChange={set('warranty_expires')} />
              </div>
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="wnotes">Warranty notes</Label>
                <Textarea id="wnotes" rows={2} value={form.warranty_notes} onChange={set('warranty_notes')} placeholder="What is covered, what voids it, claim contact." />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next time and paperwork</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nextdate">Next service due</Label>
                <Input id="nextdate" type="date" value={form.next_service_date} onChange={set('next_service_date')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nextmileage">Or at mileage</Label>
                <Input id="nextmileage" type="number" value={form.next_service_mileage} onChange={set('next_service_mileage')} placeholder="90000" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Receipt or invoice</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm transition-colors hover:border-primary hover:bg-primary/5">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span>{uploading ? 'Uploading...' : form.receipt_uri ? 'Replace file' : 'Attach a file'}</span>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  {form.receipt_uri && (
                    <span className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs">
                      <span className="max-w-[220px] truncate">{form.receipt_name || 'Attached file'}</span>
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => setForm((prev) => ({ ...prev, receipt_uri: '', receipt_name: '' }))}
                        aria-label="Remove attachment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Files are stored privately and only open for you.</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Saving...' : record ? 'Save changes' : 'Log service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}