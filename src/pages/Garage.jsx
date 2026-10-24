import React, { useCallback, useEffect, useState } from 'react';
import { Car, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import VehicleCard from '@/components/vehicles/VehicleCard';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { Button } from '@/components/ui/button';

export default function Garage() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [counts, setCounts] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [vehiclePage, agg] = await Promise.all([
      base44.entities.Vehicle.list({ sort: 'created_date', limit: 100 }),
      base44.entities.ServiceRecord.aggregate({ query: {}, groupBy: 'vehicle_id' })
    ]);
    const countMap = {};
    (agg?.rows || []).forEach((row) => {
      countMap[row.vehicle_id] = row.count;
    });
    setVehicles(vehiclePage.items || []);
    setCounts(countMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (vehicle) => {
    setEditing(vehicle);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Garage"
        title="Your vehicles"
        description="Each car keeps its own service history, warranty details and list of what needs looking at next."
      >
        <Button
          className="gap-2 rounded-xl"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add vehicle
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Add your car with its year, make, model and current mileage. Everything else builds on it."
        >
          <Button
            className="gap-2 rounded-xl"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add my first vehicle
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              recordCount={counts[vehicle.id] || 0}
              onChanged={load}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      <VehicleForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        vehicle={editing}
        onSaved={load}
      />
    </div>
  );
}