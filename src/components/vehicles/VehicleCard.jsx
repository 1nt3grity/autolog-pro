import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, ChevronRight, Pencil, Trash2, Gauge } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatMiles, vehicleTitle } from '@/lib/carUtils';

export default function VehicleCard({ vehicle, recordCount, onChanged, onEdit }) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    await base44.entities.Vehicle.delete(vehicle.id);
    toast({ title: 'Vehicle removed' });
    setConfirmOpen(false);
    onChanged?.();
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/8 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-base font-semibold leading-tight tracking-tight">{vehicle.nickname}</p>
            <p className="text-xs text-muted-foreground">{vehicleTitle(vehicle)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(vehicle)} aria-label="Edit vehicle">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmOpen(true)} aria-label="Delete vehicle">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <dl className="relative mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Odometer</dt>
          <dd className="num mt-1 text-sm font-medium">{formatMiles(vehicle.current_mileage)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Records</dt>
          <dd className="num mt-1 text-sm font-medium">{recordCount ?? 0}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Plate / VIN</dt>
          <dd className="num mt-1 truncate text-xs font-medium text-muted-foreground">
            {[vehicle.license_plate, vehicle.vin].filter(Boolean).join('  ·  ') || 'Not recorded'}
          </dd>
        </div>
      </dl>

      <Link
        to={`/vehicle/${vehicle.id}`}
        className="relative mt-5 flex items-center justify-between rounded-xl bg-secondary/70 px-4 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-secondary"
      >
        <span className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          Open service log
        </span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {vehicle.nickname}?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the vehicle only. Its service records and reminders stay in your saved data and can still be
              exported from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}