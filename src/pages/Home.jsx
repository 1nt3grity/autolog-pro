import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Car,
  ChevronRight,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Plus,
  Wrench
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatTile from '@/components/StatTile';
import EmptyState from '@/components/EmptyState';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { dueLabel, formatDate, formatMiles, formatMoney, isOverdue } from '@/lib/carUtils';
import { exportCSV, exportPDF } from '@/lib/exportData';
import { CSV_HEADERS, PDF_COLUMNS, buildCSVRows, buildPDFRows, buildSummaryLines } from '@/lib/recordExports';

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ records: 0, spend: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [exporting, setExporting] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [vehiclePage, reminderPage, recordPage, agg] = await Promise.all([
      base44.entities.Vehicle.list({ sort: '-created_date', limit: 50 }),
      base44.entities.Reminder.filter({ status: 'pending' }, { sort: 'due_date', limit: 50 }),
      base44.entities.ServiceRecord.list({ sort: '-date_performed', limit: 20 }),
      base44.entities.ServiceRecord.aggregate({ query: {}, sum: ['cost'] })
    ]);
    const row = agg?.rows?.[0] || {};
    setVehicles(vehiclePage.items || []);
    setReminders(reminderPage.items || []);
    setRecords(recordPage.items || []);
    setStats({ records: row.count || 0, spend: row.sum_cost || 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const vehiclesById = useMemo(
    () => vehicles.reduce((acc, vehicle) => ({ ...acc, [vehicle.id]: vehicle }), {}),
    [vehicles]
  );

  const dueSoon = reminders.filter((reminder) => {
    const days = dueLabel(reminder);
    return isOverdue(reminder) || days.includes('day') || days === 'Due today' || days === 'Due tomorrow';
  }).length;

  const exportAll = async (kind) => {
    setExporting(kind);
    try {
      const recordPage = await base44.entities.ServiceRecord.list({ sort: '-date_performed', limit: 500 });
      const list = recordPage.items || [];
      if (!list.length) {
        toast({ title: 'Nothing to export yet', description: 'Log a service first and your export will fill up.' });
        return;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === 'csv') {
        exportCSV(`autolog-service-history-${stamp}.csv`, CSV_HEADERS, buildCSVRows(list, vehiclesById));
      } else {
        exportPDF({
          filename: `autolog-service-history-${stamp}.pdf`,
          title: 'Service history',
          subtitle: `Exported ${formatDate(new Date())}`,
          summary: buildSummaryLines(list),
          headers: PDF_COLUMNS,
          rows: buildPDFRows(list, vehiclesById)
        });
      }
      toast({ title: kind === 'csv' ? 'CSV downloaded - opens straight in Excel' : 'PDF report downloaded' });
    } catch (error) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting('');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-8 text-background sm:px-9 sm:py-10">
        <div className="grain absolute inset-0 opacity-[0.12]" />
        <div className="relative space-y-5">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">My garage</p>
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">
              Every service, part and warranty in one place
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-background/70">
              Log what was done, where, and at what mileage. AutoLog Pro keeps the receipts, watches the warranties, and
              tells you what is coming up next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="gap-2 rounded-xl" disabled={exporting === 'csv'} onClick={() => exportAll('csv')}>
              <FileSpreadsheet className="h-4 w-4" />
              {exporting === 'csv' ? 'Building CSV...' : 'Export history (CSV)'}
            </Button>
            <Button
              variant="ghost"
              className="gap-2 rounded-xl border border-background/25 text-background hover:bg-background/10 hover:text-background"
              disabled={exporting === 'pdf'}
              onClick={() => exportAll('pdf')}
            >
              <FileText className="h-4 w-4" />
              {exporting === 'pdf' ? 'Building PDF...' : 'PDF report'}
            </Button>
            <Button
              variant="ghost"
              className="gap-2 rounded-xl border border-background/25 text-background hover:bg-background/10 hover:text-background"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Vehicles" value={vehicles.length} hint={vehicles.length === 1 ? 'One car tracked' : `${vehicles.length} cars tracked`} icon={Car} />
        <StatTile label="Records logged" value={stats.records} hint="Across every vehicle" icon={Wrench} />
        <StatTile label="Total spent" value={formatMoney(stats.spend)} hint="All logged services" icon={DollarSign} tone="primary" />
        <StatTile
          label="Due soon"
          value={dueSoon}
          hint={reminders.length ? `${reminders.length} open items` : 'Nothing open'}
          icon={Bell}
        />
      </section>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Your garage is empty"
          description="Add your car to start logging services, parts, warranties and everything that needs looking at later."
        >
          <Button className="gap-2 rounded-xl" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add my first vehicle
          </Button>
        </EmptyState>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">Coming up</h2>
                <p className="text-sm text-muted-foreground">Services, inspections and warranty dates you set.</p>
              </div>
              <Link to="/garage" className="hidden text-sm font-medium text-accent hover:opacity-70 sm:block">
                View vehicles
              </Link>
            </div>

            {reminders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                Nothing scheduled. Open a vehicle and add what needs looking at next.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {reminders.slice(0, 6).map((reminder) => {
                  const overdue = isOverdue(reminder);
                  const vehicle = vehiclesById[reminder.vehicle_id];
                  return (
                    <li key={reminder.id}>
                      <Link
                        to={`/vehicle/${reminder.vehicle_id}`}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-3.5 transition-all duration-200 hover:shadow-md hover:shadow-foreground/5',
                          overdue ? 'border-destructive/40 bg-destructive/[0.03]' : 'border-border/70'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', overdue ? 'bg-destructive/10' : 'bg-secondary')}>
                            {overdue ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Bell className="h-4 w-4 text-muted-foreground" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-semibold tracking-tight">{reminder.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {vehicle?.nickname || 'Vehicle'}
                              {reminder.due_mileage ? ` · at ${formatMiles(reminder.due_mileage)}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={cn('num text-xs font-medium', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                            {dueLabel(reminder)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">Recent service</h2>
              <p className="text-sm text-muted-foreground">Your latest entries across all vehicles.</p>
            </div>
            {records.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                No service records yet. Open a vehicle to log your first one.
              </p>
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
                {records.slice(0, 6).map((record) => (
                  <li key={record.id}>
                    <Link to={`/vehicle/${record.vehicle_id}`} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/40">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="num hidden w-24 shrink-0 text-xs text-muted-foreground sm:block">
                          {formatDate(record.date_performed)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-heading text-sm font-semibold tracking-tight">{record.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {vehiclesById[record.vehicle_id]?.nickname || 'Vehicle'}
                            {record.location_name ? ` · ${record.location_name}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="num shrink-0 text-sm font-medium">{formatMoney(record.cost)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <VehicleForm open={formOpen} onOpenChange={setFormOpen} onSaved={load} />
    </div>
  );
}