import React, { useState } from 'react';
import { Calendar, MapPin, Pencil, Receipt, ShieldCheck, Trash2, Wrench } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { CATEGORY_STYLES, daysUntil, formatDate, formatMiles, formatMoney, labelFor, CATEGORY_OPTIONS } from '@/lib/carUtils';

export default function ServiceRow({ record, onChanged, onEdit }) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const warrantyDays = daysUntil(record.warranty_expires);
  const warrantyActive = warrantyDays !== null && warrantyDays >= 0;

  const openReceipt = async () => {
    setOpening(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: record.receipt_uri });
      window.open(signed_url, '_blank', 'noopener');
    } catch (error) {
      toast({ title: 'Could not open receipt', description: error.message, variant: 'destructive' });
    } finally {
      setOpening(false);
    }
  };

  const handleDelete = async () => {
    await base44.entities.ServiceRecord.delete(record.id);
    toast({ title: 'Record deleted' });
    setConfirmOpen(false);
    onChanged?.();
  };

  return (
    <div className="group rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 hover:border-border hover:shadow-md hover:shadow-foreground/5 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="num w-fit shrink-0 rounded-xl bg-foreground px-3 py-2 text-center text-background">
          <p className="text-[10px] uppercase tracking-[0.14em] opacity-70">{formatDate(record.date_performed).split(' ')[0]}</p>
          <p className="text-sm font-semibold leading-tight">{formatDate(record.date_performed).split(' ')[1]?.replace(',', '')}</p>
          <p className="text-[10px] opacity-70">{formatDate(record.date_performed).split(' ')[2]}</p>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-[15px] font-semibold tracking-tight">{record.title}</h3>
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide', CATEGORY_STYLES[record.category] || CATEGORY_STYLES.other)}>
              {labelFor(CATEGORY_OPTIONS, record.category)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {record.mileage !== undefined && record.mileage !== null && (
              <span className="num flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                {formatMiles(record.mileage)}
              </span>
            )}
            {record.location_name && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {record.location_name}
                {record.location_address ? ` · ${record.location_address}` : ''}
              </span>
            )}
            {record.performed_by && <span>By {record.performed_by}</span>}
          </div>

          {record.description && <p className="text-sm leading-relaxed text-muted-foreground">{record.description}</p>}

          {Array.isArray(record.parts_replaced) && record.parts_replaced.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {record.parts_replaced.map((part) => (
                <span key={part} className="rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">
                  {part}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            {record.warranty_provider || record.warranty_expires || record.warranty_months ? (
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium',
                  warrantyActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {record.warranty_provider || 'Warranty'}
                {record.warranty_expires ? ` · ${warrantyActive ? `${warrantyDays} days left` : `expired ${formatDate(record.warranty_expires)}`}` : ''}
                {!record.warranty_expires && record.warranty_months ? ` · ${record.warranty_months} mo` : ''}
              </span>
            ) : null}
            {record.next_service_date && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Next due {formatDate(record.next_service_date)}
              </span>
            )}
            {record.receipt_uri && (
              <button
                type="button"
                onClick={openReceipt}
                disabled={opening}
                className="flex items-center gap-1.5 text-[11px] font-medium text-accent transition-opacity hover:opacity-70"
              >
                <Receipt className="h-3.5 w-3.5" />
                {opening ? 'Opening...' : 'View receipt'}
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
          <p className="num text-base font-semibold tracking-tight">{formatMoney(record.cost)}</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(record)} aria-label="Edit record">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmOpen(true)} aria-label="Delete record">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              {record.title} on {formatDate(record.date_performed)} will be removed from your history permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}