import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Calendar,
  Car,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Gauge,
  Pencil,
  Plus,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatTile from '@/components/StatTile';
import EmptyState from '@/components/EmptyState';
import VehicleForm from '@/components/vehicles/VehicleForm';
import ServiceForm from '@/components/service/ServiceForm';
import ServiceRow from '@/components/service/ServiceRow';
import ReminderForm from '@/components/reminders/ReminderForm';
import ReminderRow from '@/components/reminders/ReminderRow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { daysUntil, dueLabel, formatDate, formatMiles, formatMoney, vehicleTitle } from '@/lib/carUtils';
import { exportCSV, exportPDF } from '@/lib/exportData';
import { CSV_HEADERS, PDF_COLUMNS, buildCSVRows, buildPDFRows, buildSummaryLines } from '@/lib/recordExports';

export default function VehicleDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ records: 0, spend: 0 });
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const load = useCallback(async () => {
    const vehicleData = await base44.entities.Vehicle.get(id).catch(() => null);
    if (!vehicleData) {
      setVehicle(null);
      setLoading(false);
      return;
    }
    setVehicle(vehicleData);
    const [recordPage, reminderPage, agg] = await Promise.all([
      base44.entities.ServiceRecord.filter({ vehicle_id: id }, { sort: '-date_performed', limit: 100 }),
      base44.entities.Reminder.filter({ vehicle_id: id }, { sort: 'due_date', limit: 100 }),
      base44.entities.ServiceRecord.aggregate({ query: { vehicle_id: id }, sum: ['cost'] })
    ]);
    const row = agg?.rows?.[0] || {};
    setRecords(recordPage.items || []);
    setReminders(reminderPage.items || []);
    setStats({ records: row.count || 0, spend: row.sum_cost || 0 });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(() => reminders.filter((reminder) => reminder.status === 'pending'), [reminders]);
  const closed = useMemo(() => reminders.filter((reminder) => reminder.status !== 'pending'), [reminders]);
  const nextDue = pending[0];
  const vehiclesById = useMemo(() => (vehicle ? { [vehicle.id]: vehicle } : {}), [vehicle]);
  const warrantyRecords = useMemo(
    () => records.filter((record) => record.warranty_provider || record.warranty_expires || record.warranty_months || record.warranty_miles),
    [records]
  );

  const exportCar = (kind) => {
    if (!records.length) {
      toast({ title: 'No records for this car yet' });
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const slug = (vehicle.nickname || 'vehicle').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (kind === 'csv') {
      exportCSV(`autolog-${slug}-${stamp}.csv`, CSV_HEADERS, buildCSVRows(records, vehiclesById));
    } else {
      exportPDF({
        filename: `autolog-${slug}-${stamp}.pdf`,
        title: `${vehicle.nickname} - service history`,
        subtitle: `${vehicleTitle(vehicle)} · exported ${formatDate(new Date())}`,
        summary: buildSummaryLines(records),
        headers: PDF_COLUMNS,
        rows: buildPDFRows(records, vehiclesById)
      });
    }
    toast({ title: kind === 'csv' ? 'CSV downloaded' : 'PDF report downloaded' });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <EmptyState icon={Car} title="Vehicle not found" description="This car may have been removed from your garage.">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/garage">Back to garage</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-7">
      <Link to="/garage" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Garage
      </Link>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
            <Car className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">{vehicleTitle(vehicle)}</p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{vehicle.nickname}</h1>
            <p className="num text-xs text-muted-foreground">
              {[vehicle.license_plate, vehicle.vin, vehicle.color].filter(Boolean).join('  ·  ') || 'No plate or VIN recorded'}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setVehicleFormOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit vehicle
        </Button>
      </div>

      {vehicle.notes && (
        <p className="rounded-2xl border border-border/70 bg-secondary/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          {vehicle.notes}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Odometer" value={formatMiles(vehicle.current_mileage)} hint={vehicle.mileage_updated ? `Updated ${formatDate(vehicle.mileage_updated)}` : 'Add mileage anytime'} icon={Gauge} />
        <StatTile label="Records" value={stats.records} hint="Logged services and repairs" icon={Wrench} />
        <StatTile label="Spent on this car" value={formatMoney(stats.spend)} hint="All logged costs" icon={DollarSign} tone="primary" />
        <StatTile
          label="Next due"
          value={nextDue ? dueLabel(nextDue) : 'Nothing set'}
          hint={nextDue ? nextDue.title : 'Add something to watch'}
          icon={Bell}
        />
      </section>

      <Tabs defaultValue="history" className="space-y-5">
        <TabsList className="rounded-xl">
          <TabsTrigger value="history" className="rounded-lg">
            Service history
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-lg">
            Coming up {pending.length ? `(${pending.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="warranty" className="rounded-lg">
            Warranty
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {records.length ? `${records.length} record${records.length === 1 ? '' : 's'} on file` : 'Nothing logged yet'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => exportCar('csv')}>
                <FileSpreadsheet className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => exportCar('pdf')}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => {
                  setEditingRecord(null);
                  setServiceFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Log service
              </Button>
            </div>
          </div>

          {records.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No service records yet"
              description="Log the date, mileage, shop, parts and cost. Add warranty terms and the app reminds you before they run out."
            >
              <Button
                className="gap-2 rounded-xl"
                onClick={() => {
                  setEditingRecord(null);
                  setServiceFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Log the first service
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <ServiceRow
                  key={record.id}
                  record={record}
                  onChanged={load}
                  onEdit={(item) => {
                    setEditingRecord(item);
                    setServiceFormOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Services, inspections and renewals to look after.</p>
            <Button
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => {
                setEditingReminder(null);
                setReminderFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>

          {pending.length === 0 && closed.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nothing coming up"
              description="Add the next oil change, inspection or warranty date and it will show on your dashboard too."
            />
          ) : (
            <div className="space-y-3">
              {pending.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  onChanged={load}
                  onEdit={(item) => {
                    setEditingReminder(item);
                    setReminderFormOpen(true);
                  }}
                />
              ))}
              {closed.length > 0 && (
                <>
                  <h3 className="pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Closed items</h3>
                  {closed.map((reminder) => (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                      onChanged={load}
                      onEdit={(item) => {
                        setEditingReminder(item);
                        setReminderFormOpen(true);
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Warranty terms you recorded against each job, so you know what is still covered.
          </p>

          {warrantyRecords.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No warranty details yet"
              description="When you log a service, add the provider, months or miles covered and the expiry date. It all shows here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {warrantyRecords.map((record) => {
                const remaining = daysUntil(record.warranty_expires);
                const active = remaining === null || remaining >= 0;
                return (
                  <article key={record.id} className="rounded-2xl border border-border/70 bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-sm font-semibold tracking-tight">{record.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {record.warranty_provider || 'Warranty'} · logged {formatDate(record.date_performed)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                          active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        {active ? 'Covered' : 'Expired'}
                      </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-3.5 text-xs">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Months</dt>
                        <dd className="num mt-1 font-medium">{record.warranty_months ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Miles</dt>
                        <dd className="num mt-1 font-medium">{record.warranty_miles ? formatMiles(record.warranty_miles) : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Expires</dt>
                        <dd className="num mt-1 font-medium">
                          {record.warranty_expires ? (active ? `${remaining} days` : formatDate(record.warranty_expires)) : '—'}
                        </dd>
                      </div>
                    </dl>
                    {record.warranty_notes && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{record.warranty_notes}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VehicleForm open={vehicleFormOpen} onOpenChange={setVehicleFormOpen} vehicle={vehicle} onSaved={load} />
      <ServiceForm
        open={serviceFormOpen}
        onOpenChange={(open) => {
          setServiceFormOpen(open);
          if (!open) setEditingRecord(null);
        }}
        vehicle={vehicle}
        record={editingRecord}
        onSaved={load}
      />
      <ReminderForm
        open={reminderFormOpen}
        onOpenChange={(open) => {
          setReminderFormOpen(open);
          if (!open) setEditingReminder(null);
        }}
        vehicle={vehicle}
        reminder={editingReminder}
        onSaved={load}
      />
    </div>
  );
}