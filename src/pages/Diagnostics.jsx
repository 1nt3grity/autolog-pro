import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, ListChecks } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import SymptomGrid from '@/components/diagnostics/SymptomGrid';
import WarningLights from '@/components/diagnostics/WarningLights';
import SavedRuns from '@/components/diagnostics/SavedRuns';
import ChecklistRunner from '@/components/diagnostics/ChecklistRunner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { SYMPTOMS } from '@/lib/symptoms';

export default function Diagnostics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [runs, setRuns] = useState([]);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [existingRun, setExistingRun] = useState(null);

  const load = useCallback(async () => {
    const [vehiclePage, runPage] = await Promise.all([
      base44.entities.Vehicle.list({ sort: 'created_date', limit: 100 }),
      base44.entities.DiagnosticRun.list({ sort: '-updated_date', limit: 100 })
    ]);
    const list = vehiclePage.items || [];
    setVehicles(list);
    setRuns(runPage.items || []);
    setVehicleId((current) => current || list[0]?.id || '');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const vehicle = useMemo(() => vehicles.find((item) => item.id === vehicleId) || null, [vehicles, vehicleId]);
  const vehicleNames = useMemo(
    () => vehicles.reduce((acc, item) => ({ ...acc, [item.id]: item.nickname }), {}),
    [vehicles]
  );

  const startChecklist = (symptom) => {
    const match = runs.find(
      (run) => run.symptom_id === symptom.id && run.vehicle_id === vehicleId && run.status === 'in_progress'
    );
    setActiveSymptom(symptom);
    setExistingRun(match || null);
    setRunnerOpen(true);
  };

  const resumeRun = (run) => {
    const symptom = SYMPTOMS.find((item) => item.id === run.symptom_id);
    if (!symptom) {
      toast({ title: 'That checklist is no longer in the library', variant: 'destructive' });
      return;
    }
    setActiveSymptom(symptom);
    setExistingRun(run);
    setRunnerOpen(true);
  };

  const deleteRun = async (run) => {
    await base44.entities.DiagnosticRun.delete(run.id);
    toast({ title: 'Checklist deleted' });
    load();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Diagnostics" title="Guided checks and symptom reference" />
        <EmptyState
          icon={Car}
          title="Add a vehicle first"
          description="Checklists are saved against a specific car so you keep a history of what you tested and what you found."
        >
          <Button asChild className="rounded-xl">
            <Link to="/garage">Open my garage</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Diagnostics"
        title="Track down a problem"
        description="Pick what you are noticing, then work through the checks step by step. Everything you tick and write down is saved to the car."
      >
        <div className="flex items-center gap-2.5">
          <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground sm:block">Vehicle</span>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger className="w-[220px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Tabs defaultValue="checklists" className="space-y-5">
        <TabsList className="rounded-xl">
          <TabsTrigger value="checklists" className="gap-2 rounded-lg">
            <ListChecks className="h-4 w-4" />
            Guided checklists
          </TabsTrigger>
          <TabsTrigger value="reference" className="rounded-lg">
            Symptom and light reference
          </TabsTrigger>
          <TabsTrigger value="saved" className="rounded-lg">
            Saved runs {runs.length ? `(${runs.length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklists">
          <SymptomGrid onStart={startChecklist} mode="checklist" activeSymptomId={existingRun?.symptom_id} />
        </TabsContent>

        <TabsContent value="reference" className="space-y-9">
          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">Dashboard warning lights</h2>
              <p className="text-sm text-muted-foreground">What each light means and how urgent it is.</p>
            </div>
            <WarningLights />
          </section>
          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">Common symptoms</h2>
              <p className="text-sm text-muted-foreground">Likely causes for the noises, smells and shakes you might notice.</p>
            </div>
            <SymptomGrid onStart={startChecklist} mode="reference" activeSymptomId={existingRun?.symptom_id} />
          </section>
        </TabsContent>

        <TabsContent value="saved">
          <SavedRuns runs={runs} vehicleNames={vehicleNames} onResume={resumeRun} onDelete={deleteRun} />
        </TabsContent>
      </Tabs>

      <ChecklistRunner
        open={runnerOpen}
        onOpenChange={setRunnerOpen}
        vehicle={vehicle}
        symptom={activeSymptom}
        existingRun={existingRun}
        onSaved={load}
      />
    </div>
  );
}