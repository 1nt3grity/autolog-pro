import { CATEGORY_OPTIONS, formatDate, formatMoney, labelFor, vehicleTitle } from '@/lib/carUtils';

export const CSV_HEADERS = [
  'Date',
  'Vehicle',
  'Service',
  'Category',
  'Mileage',
  'Shop',
  'Address',
  'Performed by',
  'Parts replaced',
  'Details',
  'Cost',
  'Warranty provider',
  'Warranty expires',
  'Next service due',
  'Next service mileage',
  'Receipt file'
];

export const PDF_COLUMNS = [
  { label: 'Date', weight: 1 },
  { label: 'Vehicle', weight: 1.3 },
  { label: 'Service', weight: 2 },
  { label: 'Mileage', weight: 0.95 },
  { label: 'Shop', weight: 1.5 },
  { label: 'Cost', weight: 0.9 }
];

const vehicleName = (vehiclesById, vehicleId) => {
  const vehicle = vehiclesById[vehicleId];
  if (!vehicle) return 'Unknown vehicle';
  return vehicle.nickname || vehicleTitle(vehicle);
};

export function buildCSVRows(records, vehiclesById) {
  return records.map((record) => [
    formatDate(record.date_performed),
    vehicleName(vehiclesById, record.vehicle_id),
    record.title || '',
    labelFor(CATEGORY_OPTIONS, record.category),
    record.mileage ?? '',
    record.location_name || '',
    record.location_address || '',
    record.performed_by || '',
    (record.parts_replaced || []).join('; '),
    record.description || '',
    record.cost ?? '',
    record.warranty_provider || '',
    record.warranty_expires ? formatDate(record.warranty_expires) : '',
    record.next_service_date ? formatDate(record.next_service_date) : '',
    record.next_service_mileage ?? '',
    record.receipt_name || ''
  ]);
}

export function buildPDFRows(records, vehiclesById) {
  return records.map((record) => [
    formatDate(record.date_performed),
    vehicleName(vehiclesById, record.vehicle_id),
    record.title || '',
    record.mileage !== undefined && record.mileage !== null ? `${Number(record.mileage).toLocaleString()} mi` : '',
    record.location_name || '',
    record.cost !== undefined && record.cost !== null ? formatMoney(record.cost) : ''
  ]);
}

export function buildSummaryLines(records) {
  const total = records.reduce((sum, record) => sum + (Number(record.cost) || 0), 0);
  const miles = records.map((record) => Number(record.mileage)).filter((value) => !Number.isNaN(value) && value > 0);
  const lines = [`Records: ${records.length}`, `Total spent: ${formatMoney(total)}`];
  if (miles.length) {
    lines.push(`Odometer range: ${Math.min(...miles).toLocaleString()} to ${Math.max(...miles).toLocaleString()} mi`);
  }
  return lines;
}