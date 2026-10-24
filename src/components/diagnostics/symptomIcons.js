import { Activity, AlertTriangle, Battery, Disc, Droplet, Gauge, Thermometer, Wind, Zap } from 'lucide-react';

export const SYMPTOM_ICONS = {
  disc: Disc,
  gauge: Gauge,
  alert: AlertTriangle,
  activity: Activity,
  zap: Zap,
  battery: Battery,
  thermometer: Thermometer,
  wind: Wind,
  droplet: Droplet
};

export const getSymptomIcon = (key) => SYMPTOM_ICONS[key] || Activity;