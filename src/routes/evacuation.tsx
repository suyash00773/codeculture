import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { INFRASTRUCTURE } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import { MapPanel } from "@/components/pravaah/MapPanel";

export const Route = createFileRoute("/evacuation")({
  head: pageHead(
    "Evacuation",
    "Evacuation zones, safe zones, shelters and emergency services for districts where modelled risk reaches HIGH or EXTREME.",
  ),
  component: EvacuationPage,
});

function EvacuationPage() {
  const all = useMemo(() => assessAll(), []);
  const zones = all.filter((a) => a.risk_score > 50);
  const shelters = INFRASTRUCTURE.filter((i) => i.type === "SHELTER");
  const hospitals = INFRASTRUCTURE.filter((i) => i.type === "HOSPITAL");

  return (
    <>
      <PageHeader
        title="Evacuation"
        subtitle="Evacuation planning activates automatically when modelled risk crosses the HIGH threshold. Zones below are simulated."
      />
      <DemoBanner />

      {zones.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            No district currently exceeds the HIGH threshold. Evacuation planning is idle.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Evacuation zones" className="xl:col-span-2">
            <MapPanel assessments={zones} height={420} />
          </Panel>
          <div className="space-y-4">
            <Panel title={`Active evacuation zones (${zones.length})`}>
              <ul className="space-y-2 text-sm">
                {zones.map((z) => (
                  <li key={z.location_id} className="rounded-md border border-border p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{z.location_name}</span>
                      <RiskBadge level={z.risk_level} score={z.risk_score} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Evacuate {z.population_exposed.toLocaleString("en-IN")} people from a{" "}
                      {z.affected_area_km2} km² footprint · {z.recommended_action}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Shelters & emergency services">
              <ul className="space-y-1.5 text-sm">
                {[...shelters, ...hospitals].map((s) => (
                  <li key={s.id} className="flex justify-between gap-2 border-b border-border/50 pb-1">
                    <span>{s.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.type} · {s.population_served.toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
