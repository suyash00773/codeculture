import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { DISTRICTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, Meter, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/risk-analysis")({
  head: pageHead(
    "Risk Analysis",
    "Per-district breakdown of hazard probabilities, driver signals and explainable factor contributions from the prototype risk model.",
  ),
  component: RiskAnalysis,
});

function RiskAnalysis() {
  const all = useMemo(() => assessAll(), []);
  const [id, setId] = useState(all[0]!.location_id);
  const a = all.find((x) => x.location_id === id)!;
  const d = DISTRICTS.find((x) => x.id === id)!;

  return (
    <>
      <PageHeader
        title="Risk Analysis"
        subtitle="Risk Score = Hazard Probability + Severity + Exposure + Vulnerability + Cascade Risk, normalised to 0–100."
        actions={
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {all.map((x) => (
              <option key={x.location_id} value={x.location_id}>
                {x.location_name}, {x.state}
              </option>
            ))}
          </select>
        }
      />
      <DemoBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Risk score" right={<RiskBadge level={a.risk_level} />}>
          <p className="text-5xl font-semibold tabular-nums">{a.risk_score}<span className="text-lg text-muted-foreground">/100</span></p>
          <div className="mt-3">
            <Meter value={a.risk_score} level={a.risk_level} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Bands: 0–25 LOW · 26–50 MODERATE · 51–75 HIGH · 76–100 EXTREME. Prototype Risk Model —
            weights are configurable and not scientifically validated.
          </p>
        </Panel>

        <Panel title="Hazard probabilities">
          <ul className="space-y-2 text-sm">
            {Object.entries(a.hazard_probabilities).map(([k, v]) => (
              <li key={k}>
                <div className="flex justify-between">
                  <span className="capitalize text-muted-foreground">{k.replace("_", " ")}</span>
                  <span className="font-mono">{Math.round(v * 100)}%</span>
                </div>
                <Meter value={v * 100} level={a.risk_level} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Driver signals (demo)">
          <dl className="space-y-1.5 text-sm">
            {[
              ["Rainfall 24h", `${d.signals.rainfall_mm_24h} mm`],
              ["Soil moisture", `${d.signals.soil_moisture_pct}%`],
              ["River level", `${d.signals.river_level_pct}% of danger mark`],
              ["Mean slope", `${d.signals.slope_deg}°`],
              ["Elevation", `${d.signals.elevation_m} m`],
              ["Historical events", String(d.signals.historical_events)],
              ["Temperature", `${d.signals.temperature_c} °C`],
              ["Population density", `${d.signals.population_density}/km²`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel title="Model explainability — why this score?">
        <ol className="grid gap-2 md:grid-cols-2">
          {a.factors.map((f, i) => (
            <li key={f.factor} className="rounded-md border border-border p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {i + 1}. {f.factor}
                </span>
                <span className="font-mono">{f.contribution}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Observed value: {f.value}</p>
              <div className="mt-2">
                <Meter value={f.contribution * 2.5} level={a.risk_level} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Contribution = normalised feature value × configured weight, expressed as a share of the total score.
          A SHAP-based explainer can replace this logic once a trained model is in place.
        </p>
      </Panel>
    </>
  );
}
