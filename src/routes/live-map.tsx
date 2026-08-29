import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { DISTRICTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import { MapPanel } from "@/components/pravaah/MapPanel";
import type { RiskLevel } from "@/lib/pravaah/types";

export const Route = createFileRoute("/live-map")({
  head: pageHead(
    "Live Risk Map",
    "Interactive GIS view of modelled multi-hazard risk zones across Himalayan and Northeast Indian districts.",
  ),
  component: LiveMap,
});

const LEVELS: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "EXTREME"];

function LiveMap() {
  const all = useMemo(() => assessAll(), []);
  const [state, setState] = useState("ALL");
  const [hazard, setHazard] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [showInfra, setShowInfra] = useState(true);

  const states = ["ALL", ...Array.from(new Set(DISTRICTS.map((d) => d.state)))];
  const hazards = ["ALL", ...Array.from(new Set(DISTRICTS.flatMap((d) => d.primary_hazards)))];

  const filtered = all.filter((a) => {
    const d = DISTRICTS.find((x) => x.id === a.location_id)!;
    return (
      (state === "ALL" || a.state === state) &&
      (hazard === "ALL" || d.primary_hazards.includes(hazard as never)) &&
      (level === "ALL" || a.risk_level === level) &&
      (query === "" || `${a.location_name} ${a.state}`.toLowerCase().includes(query.toLowerCase()))
    );
  });

  const current = filtered.find((a) => a.location_id === selected);

  const selectCls =
    "rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-ring";

  return (
    <>
      <PageHeader title="Live Risk Map" subtitle="Zoom, filter and click a zone to inspect its modelled risk profile." />
      <DemoBanner />

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={selectCls}
            placeholder="Search district…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className={selectCls} value={state} onChange={(e) => setState(e.target.value)}>
            {states.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All states" : s}
              </option>
            ))}
          </select>
          <select className={selectCls} value={hazard} onChange={(e) => setHazard(e.target.value)}>
            {hazards.map((h) => (
              <option key={h} value={h}>
                {h === "ALL" ? "All hazards" : h.replace("_", " ")}
              </option>
            ))}
          </select>
          <select className={selectCls} value={level} onChange={(e) => setLevel(e.target.value)}>
            {["ALL", ...LEVELS].map((l) => (
              <option key={l} value={l}>
                {l === "ALL" ? "All risk levels" : l}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={showInfra} onChange={(e) => setShowInfra(e.target.checked)} />
            Infrastructure layer
          </label>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} zones shown</span>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel className="xl:col-span-3">
          <MapPanel
            assessments={filtered}
            onSelect={setSelected}
            {...(selected ? { selectedId: selected } : {})}
            height={620}
            showInfrastructure={showInfra}
          />
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {LEVELS.map((l) => (
              <span key={l} className="flex items-center gap-1.5">
                <RiskBadge level={l} />
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Zone detail">
          {!current ? (
            <p className="text-sm text-muted-foreground">Select a risk zone on the map to see its profile.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-lg font-semibold">{current.location_name}</p>
                <p className="text-muted-foreground">{current.state}</p>
              </div>
              <RiskBadge level={current.risk_level} score={current.risk_score} />
              <dl className="space-y-1.5">
                {[
                  ["Flood probability", `${Math.round((current.hazard_probabilities["flood"] ?? 0) * 100)}%`],
                  ["Landslide probability", `${Math.round((current.hazard_probabilities["landslide"] ?? 0) * 100)}%`],
                  ["Flash-flood probability", `${Math.round((current.hazard_probabilities["flash_flood"] ?? 0) * 100)}%`],
                  ["Cascade risk", `${Math.round(current.cascade_probability * 100)}%`],
                  ["Population exposed", current.population_exposed.toLocaleString("en-IN")],
                  ["Critical infrastructure", String(current.infrastructure_exposed)],
                  ["Affected area", `${current.affected_area_km2} km²`],
                  ["Model confidence", `${Math.round(current.confidence * 100)}%`],
                  ["Last updated", new Date(current.generated_at).toLocaleTimeString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-border/50 pb-1">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="rounded-md border border-border bg-muted/40 p-2 text-xs">
                Recommended action: <b>{current.recommended_action}</b>
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
