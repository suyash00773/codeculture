import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { ALERTS, INCIDENTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, KpiCard, Meter, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import { MapPanel } from "@/components/pravaah/MapPanel";

export const Route = createFileRoute("/")({
  head: pageHead(
    "Command Dashboard",
    "Multi-hazard early-warning decision support for Indian districts: live risk scores, cascade intelligence, exposure and simulated alerts.",
  ),
  component: Dashboard,
});

function Dashboard() {
  const assessments = useMemo(() => assessAll(), []);
  const [selected, setSelected] = useState(assessments[0]!.location_id);
  const current = assessments.find((a) => a.location_id === selected)!;

  const highRisk = assessments.filter((a) => a.risk_score > 50);
  const peopleAtRisk = highRisk.reduce((a, x) => a + x.population_exposed, 0);
  const infra = highRisk.reduce((a, x) => a + x.infrastructure_exposed, 0);
  const activeIncidents = INCIDENTS.filter((i) => i.status !== "CLOSED");

  return (
    <>
      <PageHeader
        title="Command Dashboard"
        subtitle="Decision-support view across monitored Himalayan and Northeast districts. Outputs are risk estimates and probabilities — not deterministic disaster predictions."
        actions={
          <Link
            to="/simulation"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Run simulation
          </Link>
        }
      />
      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Active alerts" value={String(ALERTS.length)} hint="All flagged SIMULATION" tone="HIGH" />
        <KpiCard label="High-risk zones" value={String(highRisk.length)} hint={`of ${assessments.length} monitored`} tone="EXTREME" />
        <KpiCard label="People at risk" value={peopleAtRisk.toLocaleString("en-IN")} hint="Modelled exposure footprint" />
        <KpiCard label="Critical infrastructure" value={String(infra)} hint="Assets inside risk zones" />
        <KpiCard label="Active incidents" value={String(activeIncidents.length)} hint="Field reports open" tone="MODERATE" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Live disaster risk map"
          className="xl:col-span-2"
          right={
            <Link to="/live-map" className="text-xs text-primary hover:underline">
              Open full map →
            </Link>
          }
        >
          <MapPanel assessments={assessments} onSelect={setSelected} selectedId={selected} height={460} />
        </Panel>

        <div className="space-y-4">
          <Panel title="Selected zone" right={<RiskBadge level={current.risk_level} score={current.risk_score} />}>
            <p className="text-lg font-semibold">
              {current.location_name}, {current.state}
            </p>
            <div className="mt-3 space-y-2.5 text-sm">
              {current.factors.slice(0, 4).map((f) => (
                <div key={f.factor}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{f.factor}</span>
                    <span className="font-mono">{f.value}</span>
                  </div>
                  <Meter value={f.contribution * 3} level={current.risk_level} />
                </div>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="label-mono">Cascade risk</dt>
                <dd className="font-semibold">{Math.round(current.cascade_probability * 100)}%</dd>
              </div>
              <div>
                <dt className="label-mono">Population exposed</dt>
                <dd className="font-semibold">{current.population_exposed.toLocaleString("en-IN")}</dd>
              </div>
              <div>
                <dt className="label-mono">Recommended action</dt>
                <dd className="font-semibold">{current.recommended_action}</dd>
              </div>
              <div>
                <dt className="label-mono">Model confidence</dt>
                <dd className="font-semibold">{Math.round(current.confidence * 100)}%</dd>
              </div>
            </dl>
            <Link
              to="/cascade-analysis"
              className="mt-4 inline-block text-xs text-primary hover:underline"
            >
              View cascade chain →
            </Link>
          </Panel>

          <Panel title="Active simulation alerts" right={<Link to="/alerts" className="text-xs text-primary hover:underline">All →</Link>}>
            <ul className="space-y-2.5">
              {ALERTS.slice(0, 3).map((a) => (
                <li key={a.id} className="rounded-md border border-border p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.location}</span>
                    <RiskBadge level={a.risk_level} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.message}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Ranked district risk">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["District", "State", "Score", "Level", "Primary hazard", "Cascade", "Exposed"].map((h) => (
                  <th key={h} className="label-mono py-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.location_id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-medium">{a.location_name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{a.state}</td>
                  <td className="py-2 pr-4 font-mono tabular-nums">{a.risk_score}</td>
                  <td className="py-2 pr-4">
                    <RiskBadge level={a.risk_level} />
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{a.primary_hazard.replace("_", " ")}</td>
                  <td className="py-2 pr-4 font-mono">{Math.round(a.cascade_probability * 100)}%</td>
                  <td className="py-2 pr-4 font-mono">{a.population_exposed.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
