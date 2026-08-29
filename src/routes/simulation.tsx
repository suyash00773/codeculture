import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { pageHead } from "@/lib/pravaah/head";
import { runSimulation } from "@/lib/pravaah/risk.functions";
import { DISTRICTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, Meter, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/simulation")({
  head: pageHead(
    "Disaster Simulation",
    "Run what-if scenarios: change rainfall, soil moisture, river level and slope, then watch the modelled risk, cascade and response plan update.",
  ),
  component: SimulationPage,
});

function SimulationPage() {
  const [locationId, setLocationId] = useState(DISTRICTS[0]!.id);
  const base = DISTRICTS.find((d) => d.id === locationId)!;
  const [rain, setRain] = useState(base.signals.rainfall_mm_24h);
  const [soil, setSoil] = useState(base.signals.soil_moisture_pct);
  const [river, setRiver] = useState(base.signals.river_level_pct);
  const [slope, setSlope] = useState(base.signals.slope_deg);
  const [blockage, setBlockage] = useState(base.signals.river_blockage_index);

  const run = useServerFn(runSimulation);
  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          location_id: locationId,
          rainfall_mm_24h: rain,
          soil_moisture_pct: soil,
          river_level_pct: river,
          slope_deg: slope,
          river_blockage_index: blockage,
        },
      }),
  });

  function onLocationChange(id: string) {
    const d = DISTRICTS.find((x) => x.id === id)!;
    setLocationId(id);
    setRain(d.signals.rainfall_mm_24h);
    setSoil(d.signals.soil_moisture_pct);
    setRiver(d.signals.river_level_pct);
    setSlope(d.signals.slope_deg);
    setBlockage(d.signals.river_blockage_index);
    mutation.reset();
  }

  const sliders: Array<[string, number, (v: number) => void, number, number, number, string]> = [
    ["Rainfall (24h)", rain, setRain, 0, 500, 1, "mm"],
    ["Soil moisture", soil, setSoil, 0, 100, 1, "%"],
    ["River level", river, setRiver, 0, 120, 1, "% of danger mark"],
    ["Mean slope", slope, setSlope, 0, 60, 1, "°"],
    ["River blockage index", blockage, setBlockage, 0, 1, 0.01, ""],
  ];

  const result = mutation.data;

  return (
    <>
      <PageHeader
        title="Disaster Simulation"
        subtitle="SIMULATION MODE — scenario outputs are model estimates on synthetic data and never represent an official forecast."
      />
      <DemoBanner text="Scenario runs execute on the server against the prototype risk + cascade engine." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Scenario inputs">
          <label className="block text-sm">
            <span className="label-mono">Location</span>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={locationId}
              onChange={(e) => onLocationChange(e.target.value)}
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 space-y-4">
            {sliders.map(([label, value, set, min, max, step, unit]) => (
              <label key={label} className="block">
                <span className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">
                    {step < 1 ? value.toFixed(2) : Math.round(value)} {unit}
                  </span>
                </span>
                <input
                  type="range"
                  className="mt-1 w-full accent-[var(--primary)]"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-5 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? "Running…" : "RUN SIMULATION"}
          </button>
          {mutation.isError && (
            <p className="mt-2 text-xs text-risk-extreme">
              Simulation failed: {(mutation.error as Error).message}.{" "}
              <button className="underline" onClick={() => mutation.mutate()}>
                Retry
              </button>
            </p>
          )}
        </Panel>

        <div className="space-y-4 lg:col-span-2">
          {!result ? (
            <Panel title="Scenario output">
              <p className="text-sm text-muted-foreground">
                Adjust the drivers and run the scenario to see risk score, cascade chain, exposure and the
                recommended response plan.
              </p>
            </Panel>
          ) : (
            <>
              <Panel title="Risk change">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="label-mono">Baseline</p>
                    <p className="text-3xl font-semibold tabular-nums">{result.before.risk_score}</p>
                    <RiskBadge level={result.before.risk_level} />
                  </div>
                  <ArrowRight className="size-6 text-muted-foreground" />
                  <div>
                    <p className="label-mono">Simulated</p>
                    <p className="text-3xl font-semibold tabular-nums">{result.after.risk_score}</p>
                    <RiskBadge level={result.after.risk_level} />
                  </div>
                  <div className="ml-auto text-right text-sm">
                    <p className="label-mono">Recommended action</p>
                    <p className="text-lg font-semibold">{result.after.recommended_action}</p>
                    <p className="text-xs text-muted-foreground">
                      Model confidence {Math.round(result.after.confidence * 100)}% ·{" "}
                      {result.after.model_version}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Cascade risk", `${Math.round(result.after.cascade_probability * 100)}%`],
                    ["Population exposed", result.after.population_exposed.toLocaleString("en-IN")],
                    ["Infrastructure at risk", String(result.after.infrastructure_exposed)],
                    ["Affected area", `${result.after.affected_area_km2} km²`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border p-2.5">
                      <p className="label-mono">{k}</p>
                      <p className="mt-1 font-mono text-lg">{v}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <div className="grid gap-4 md:grid-cols-2">
                <Panel title="Cascade propagation">
                  <ol className="space-y-2">
                    {result.after.cascade_chain.map((s, i) => (
                      <li
                        key={s.id}
                        className="rounded-md border border-border p-2"
                        style={{ animation: `fade-in 400ms ease-out ${i * 140}ms both` }}
                      >
                        <div className="flex justify-between text-sm">
                          <span>{s.label}</span>
                          <span className="font-mono">{Math.round(s.probability * 100)}%</span>
                        </div>
                        <Meter value={s.probability * 100} level={s.triggered ? "HIGH" : "LOW"} />
                      </li>
                    ))}
                  </ol>
                </Panel>

                <Panel title="AI explanation — why did risk change?">
                  <ul className="space-y-2 text-sm">
                    {result.after.factors.map((f, i) => (
                      <li key={f.factor} className="rounded-md border border-border p-2">
                        <div className="flex justify-between">
                          <span>
                            {i + 1}. {f.factor}
                          </span>
                          <span className="font-mono">{f.contribution}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Observed: {f.value}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Contributions are computed from the configurable prototype weights — not SHAP values from a
                    trained production model.
                  </p>
                </Panel>
              </div>

              <Panel title="Generated SIMULATION alert & recommended response">
                <div className="rounded-md border border-risk-high/40 bg-risk-high/10 p-3">
                  <p className="font-mono text-xs tracking-widest text-risk-high">SIMULATION ALERT</p>
                  <p className="mt-1 font-semibold">
                    {result.after.risk_level} {result.after.primary_hazard.replace("_", " ")} risk —{" "}
                    {result.after.location_name}, {result.after.state}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Population potentially exposed: {result.after.population_exposed.toLocaleString("en-IN")} ·
                    Infrastructure: {result.after.infrastructure_exposed} assets
                  </p>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {result.after.recommended_response.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>
    </>
  );
}
