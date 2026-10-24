import { format, parseISO, isValid, differenceInDays } from 'date-fns';

export const CATEGORY_OPTIONS = [
  { value: 'routine_maintenance', label: 'Routine maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'tires', label: 'Tires & wheels' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'fluids', label: 'Fluids & filters' },
  { value: 'body', label: 'Body & glass' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'other', label: 'Other' }
];

export const CATEGORY_STYLES = {
  routine_maintenance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  repair: 'bg-red-50 text-red-700 border-red-200',
  inspection: 'bg-sky-50 text-sky-700 border-sky-200',
  brakes: 'bg-amber-50 text-amber-700 border-amber-200',
  tires: 'bg-slate-100 text-slate-700 border-slate-200',
  electrical: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  fluids: 'bg-teal-50 text-teal-700 border-teal-200',
  body: 'bg-rose-50 text-rose-700 border-rose-200',
  diagnostic: 'bg-violet-50 text-violet-700 border-violet-200',
  other: 'bg-muted text-muted-foreground border-border'
};

export const REMINDER_TYPE_OPTIONS = [
  { value: 'maintenance', label: 'Maintenance due' },
  { value: 'warranty', label: 'Warranty expiry' },
  { value: 'inspection', label: 'Inspection / smog' },
  { value: 'registration', label: 'Registration' },
  { value: 'other', label: 'Other' }
];

export const REMINDER_TYPE_LABELS = REMINDER_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export const labelFor = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '—';

export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? format(date, 'MMM d, yyyy') : '—';
}

export function toDateInput(value) {
  if (!value) return '';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
}

export function formatMiles(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value).toLocaleString()} mi`;
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function daysUntil(value) {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(date, today);
}

export function dueLabel(reminder) {
  const days = daysUntil(reminder.due_date);
  if (days === null) {
    if (reminder.due_mileage) return `At ${formatMiles(reminder.due_mileage)}`;
    return 'No date set';
  }
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 45) return `In ${days} days`;
  return formatDate(reminder.due_date);
}

export function isOverdue(reminder) {
  const days = daysUntil(reminder.due_date);
  return days !== null && days < 0;
}

export function vehicleTitle(vehicle) {
  if (!vehicle) return 'Vehicle';
  const descriptor = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return descriptor || vehicle.nickname || 'Vehicle';
}

export function vehicleSubtitle(vehicle) {
  if (!vehicle) return '';
  const descriptor = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  return descriptor && vehicle.nickname ? vehicle.nickname : '';
}