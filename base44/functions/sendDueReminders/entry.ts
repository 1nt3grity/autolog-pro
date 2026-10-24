import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DAY_MS = 24 * 60 * 60 * 1000;
const MILEAGE_WINDOW = 500;

function fmtDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York'
  });
}

function describeWhen(reminder, todayISO) {
  if (reminder.due_date) {
    if (reminder.due_date < todayISO) return `${fmtDate(reminder.due_date)} (overdue)`;
    if (reminder.due_date === todayISO) return 'due today';
    return `due ${fmtDate(reminder.due_date)}`;
  }
  return `due at ${Number(reminder.due_mileage).toLocaleString('en-US')} miles`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10);
    const horizonISO = new Date(now.getTime() + 7 * DAY_MS).toISOString().slice(0, 10);

    const settingsPage = await svc.entities.UserSettings.filter({ email_reminders_enabled: true }, { limit: 500 });
    const optedIn = settingsPage.items || [];

    const results = [];
    for (const settings of optedIn) {
      const [remPage, vehPage] = await Promise.all([
        svc.entities.Reminder.filter({ created_by_id: settings.created_by_id, status: 'pending' }, { limit: 200 }),
        svc.entities.Vehicle.filter({ created_by_id: settings.created_by_id }, { limit: 100 })
      ]);
      const vehiclesById = {};
      for (const v of vehPage.items || []) vehiclesById[v.id] = v;

      const dueItems = [];
      for (const r of remPage.items || []) {
        const vehicle = vehiclesById[r.vehicle_id];
        const mileageDue = Boolean(
          r.due_mileage &&
            vehicle &&
            vehicle.current_mileage != null &&
            r.due_mileage <= vehicle.current_mileage + MILEAGE_WINDOW
        );
        const dateDue = Boolean(r.due_date && r.due_date <= horizonISO);
        if (!dateDue && !mileageDue) continue;
        const name = vehicle ? vehicle.nickname : 'your vehicle';
        dueItems.push(`${r.title} on ${name} - ${describeWhen(r, todayISO)}`);
      }

      if (!dueItems.length) {
        results.push({ email: settings.email, sent: false, reason: 'nothing due' });
        continue;
      }

      const summary = dueItems.slice(0, 8).join('. ') + (dueItems.length > 8 ? `, and ${dueItems.length - 8} more.` : '.');
      await svc.integrations.Core.SendEmail({
        to: settings.email,
        template_name: 'DueReminders',
        variables: {
          first_name: (settings.email.split('@')[0] || 'there').split(/[._-]/)[0].replace(/^./, (c) => c.toUpperCase()),
          count: String(dueItems.length),
          summary
        }
      });
      results.push({ email: settings.email, sent: true, items: dueItems.length });
    }

    return Response.json({ opted_in: optedIn.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}