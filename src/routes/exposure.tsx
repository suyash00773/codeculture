import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { DemoBanner, KpiCard, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/exposure")({
  head: pageHead(
    "Exposure",
    "Population and infrastructure exposure inside modelled hazard footprints, ranked by district.",
  ),
  component: ExposurePage,
});

function ExposurePage() {
  const all = useMemo(() => assessAll(), []);
  const totalPeople = all.reduce((a, x) => a + x.population_exposed, 0);
  const totalArea = all.reduce((a, x) => a + x.affected_area_km2, 0);
  const chart = all.map((a) => ({
    name: a.location_name,
    people: a.population_exposed,
    area: a.affected_area_km2,
  }));

  return (
    <>
      <PageHeader
        title="Exposure"
        subtitle="Exposure = modelled hazard footprint intersected with population and asset density. Values are demo estimates."
      />
      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total people exposed" value={totalPeople.toLocaleString("en-IN")} hint="Across all monitored districts" />
        <KpiCard label="Modelled footprint" value={`${totalArea.toLocaleString("en-IN")} km²`} />
        <KpiCard
          label="Districts above HIGH"
          value={String(all.filter((a) => a.risk_score > 50).length)}
          tone="HIGH"
        />
      </div>

      <Panel title="Population exposure by district">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
                formatter={(v: number) => v.toLocaleString("en-IN")}
              />
              <Bar dataKey="people" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Exposure register">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["District", "Risk", "People exposed", "Infrastructure", "Footprint", "Cascade"].map((h) => (
                  <th key={h} className="label-mono py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((a) => (
                <tr key={a.location_id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4">{a.location_name}, {a.state}</td>
                  <td className="py-2 pr-4"><RiskBadge level={a.risk_level} score={a.risk_score} /></td>
                  <td className="py-2 pr-4 font-mono">{a.population_exposed.toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-4 font-mono">{a.infrastructure_exposed}</td>
                  <td className="py-2 pr-4 font-mono">{a.affected_area_km2} km²</td>
                  <td className="py-2 pr-4 font-mono">{Math.round(a.cascade_probability * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
