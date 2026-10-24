import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { numberOrUndefined, textOrUndefined } from '@/lib/formUtils';
import { toDateInput } from '@/lib/carUtils';

const EMPTY = {
  nickname: '',
  year: '',
  make: '',
  model: '',
  trim: '',
  vin: '',
  license_plate: '',
  color: '',
  current_mileage: '',
  purchase_date: '',
  notes: ''
};

export default function VehicleForm({ open, onOpenChange, vehicle, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setForm({
        nickname: vehicle.nickname || '',
        year: vehicle.year ? String(vehicle.year) : '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        trim: vehicle.trim || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        color: vehicle.color || '',
        current_mileage: vehicle.current_mileage !== undefined && vehicle.current_mileage !== null ? String(vehicle.current_mileage) : '',
        purchase_date: toDateInput(vehicle.purchase_date),
        notes: vehicle.notes || ''
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, vehicle]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.nickname.trim()) {
      toast({ title: 'Give this car a name', description: 'A nickname keeps it easy to spot in your garage.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const mileage = numberOrUndefined(form.current_mileage);
    const payload = {
      nickname: form.nickname.trim(),
      year: numberOrUndefined(form.year),
      make: textOrUndefined(form.make),
      model: textOrUndefined(form.model),
      trim: textOrUndefined(form.trim),
      vin: textOrUndefined(form.vin),
      license_plate: textOrUndefined(form.license_plate),
      color: textOrUndefined(form.color),
      current_mileage: mileage,
      mileage_updated: mileage !== undefined ? new Date().toISOString().slice(0, 10) : undefined,
      purchase_date: textOrUndefined(form.purchase_date),
      notes: textOrUndefined(form.notes)
    };

    try {
      if (vehicle?.id) {
        await base44.entities.Vehicle.update(vehicle.id, payload);
        toast({ title: 'Vehicle updated' });
      } else {
        await base44.entities.Vehicle.create({ ...payload, active: true });
        toast({ title: 'Vehicle added to your garage' });
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit vehicle' : 'Add a vehicle'}</DialogTitle>
          <DialogDescription>
            Details you record here show up on the diagnostics page and in every export.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nickname">Nickname *</Label>
              <Input id="nickname" value={form.nickname} onChange={set('nickname')} placeholder="The daily driver" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={form.year} onChange={set('year')} placeholder="2019" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input id="make" value={form.make} onChange={set('make')} placeholder="Toyota" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={form.model} onChange={set('model')} placeholder="Camry" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trim">Trim</Label>
              <Input id="trim" value={form.trim} onChange={set('trim')} placeholder="SE" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input id="color" value={form.color} onChange={set('color')} placeholder="Silver" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plate">License plate</Label>
              <Input id="plate" value={form.license_plate} onChange={set('license_plate')} placeholder="ABC-1234" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" value={form.vin} onChange={set('vin')} placeholder="17 characters" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Current mileage</Label>
              <Input id="mileage" type="number" value={form.current_mileage} onChange={set('current_mileage')} placeholder="84500" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase_date">Purchase date</Label>
              <Input id="purchase_date" type="date" value={form.purchase_date} onChange={set('purchase_date')} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Oil type, tire size, key details you always forget." />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : vehicle ? 'Save changes' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}