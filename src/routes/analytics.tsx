import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { pageHead } from "@/lib/pravaah/head";
import { HISTORICAL_EVENTS, districtById } from "@/lib/pravaah/demo-data";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { DemoBanner, KpiCard, PageHeader, Panel, riskHex } from "@/components/pravaah/primitives";
import type { RiskLevel } from "@/lib/pravaah/types";

export const Route = createFileRoute("/analytics")({
  head: pageHead(
    "Analytics",
    "Trends across risk scores, hazard mix and historical disaster frequency for the monitored region.",
  ),
  component: AnalyticsPage,
});

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

function AnalyticsPage() {
  const all = useMemo(() => assessAll(), []);

  const byLevel = (["LOW", "MODERATE", "HIGH", "EXTREME"] as RiskLevel[]).map((level) => ({
    name: level,
    value: all.filter((a) => a.risk_level === level).length,
  }));

  const byYear = useMemo(() => {
    const m = new Map<string, { year: string; events: number; fatalities: number }>();
    for (const e of HISTORICAL_EVENTS) {
      const year = e.date.slice(0, 4);
      const row = m.get(year) ?? { year, events: 0, fatalities: 0 };
      row.events += 1;
      row.fatalities += e.fatalities ?? 0;
      m.set(year, row);
    }
    return [...m.values()].sort((a, b) => a.year.localeCompare(b.year));
  }, []);

  const rainVsRisk = all.map((a) => ({
    name: a.location_name,
    rainfall: districtById(a.location_id)?.signals.rainfall_mm_24h ?? 0,
    risk: a.risk_score,
  }));

  const hazardMix = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of HISTORICAL_EVENTS) m.set(e.event_type, (m.get(e.event_type) ?? 0) + 1);
    return [...m.entries()].map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, []);

  const avg = Math.round(all.reduce((a, x) => a + x.risk_score, 0) / all.length);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Aggregate view of model output and the historical record. Useful for spotting drift between predicted and observed hazard patterns."
      />
      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-4">
        <KpiCard label="Average risk score" value={String(avg)} />
        <KpiCard label="Districts monitored" value={String(all.length)} />
        <KpiCard label="Historical events" value={String(HISTORICAL_EVENTS.length)} />
        <KpiCard
          label="Recorded fatalities"
          value={HISTORICAL_EVENTS.reduce((a, e) => a + (e.fatalities ?? 0), 0).toLocaleString("en-IN")}
          tone="EXTREME"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Rainfall vs modelled risk score">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rainVsRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="rainfall" stroke="var(--chart-2)" dot={false} />
                <Line type="monotone" dataKey="risk" stroke="var(--chart-1)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Current risk level distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byLevel} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                  {byLevel.map((d) => (
                    <Cell key={d.name} fill={riskHex[d.name as RiskLevel]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Historical events per year">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="events" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Historical hazard mix">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardMix} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
