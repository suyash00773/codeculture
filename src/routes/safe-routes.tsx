import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { ROUTE_EDGES, ROUTE_NODES, planSafeRoute } from "@/lib/pravaah/routing";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/safe-routes")({
  head: pageHead(
    "Safe Routes",
    "Risk-weighted shortest-path planning that steers evacuation traffic away from high-risk road segments.",
  ),
  component: SafeRoutesPage,
});

function SafeRoutesPage() {
  const [start, setStart] = useState("n1");
  const [goal, setGoal] = useState("n5");
  const result = planSafeRoute(start, goal);

  const sel = "rounded-md border border-input bg-background px-2 py-1.5 text-sm";

  return (
    <>
      <PageHeader
        title="Safe Routes"
        subtitle="Dijkstra over a demo road graph. Segment cost = distance × risk penalty, so EXTREME-risk stretches are effectively avoided."
      />
      <DemoBanner text="Road graph is a hand-built demonstration network, not an OSM/road-authority dataset." />

      <Panel>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="label-mono block">Origin</span>
            <select className={sel} value={start} onChange={(e) => setStart(e.target.value)}>
              {ROUTE_NODES.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="label-mono block">Destination</span>
            <select className={sel} value={goal} onChange={(e) => setGoal(e.target.value)}>
              {ROUTE_NODES.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recommended safe route">
          {!result ? (
            <p className="text-sm text-muted-foreground">
              No connected route exists between these points in the demo graph. Choose another pair.
            </p>
          ) : (
            <>
              <p className="text-sm">
                <b>{result.distance_km} km</b> · max segment risk{" "}
                <RiskBadge level={result.max_segment_risk} />
              </p>
              <ol className="mt-3 space-y-2 text-sm">
                {result.edges.map((e, i) => (
                  <li key={`${e.from}-${e.to}-${i}`} className="rounded-md border border-border p-2.5">
                    <div className="flex justify-between gap-2">
                      <span>{e.name}</span>
                      <RiskBadge level={e.risk} />
                    </div>
                    <p className="text-xs text-muted-foreground">{e.km} km</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Panel>

        <Panel title="Road segment risk register">
          <ul className="space-y-1.5 text-sm">
            {ROUTE_EDGES.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
                <span>{e.name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{e.km} km</span>
                  <RiskBadge level={e.risk} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
