import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import { pageHead } from "@/lib/pravaah/head";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { DemoBanner, Meter, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cascade-analysis")({
  head: pageHead(
    "Cascade Analysis",
    "Model how one hazard triggers the next: rainfall to soil saturation, slope failure, river blockage, downstream flooding and exposure.",
  ),
  component: CascadePage,
});

function CascadePage() {
  const all = useMemo(() => assessAll(), []);
  const [id, setId] = useState(all[0]!.location_id);
  const a = all.find((x) => x.location_id === id)!;

  return (
    <>
      <PageHeader
        title="Cascade Analysis"
        subtitle="A modular rule chain conditions each hazard step on the previous one. It can later be replaced by a trained graph/ML model without changing this view."
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
        <Panel title="Cascade chain" className="lg:col-span-2">
          <ol className="space-y-1">
            {a.cascade_chain.map((step, i) => (
              <li key={step.id}>
                <div
                  className={cn(
                    "rounded-md border p-3",
                    step.triggered ? "border-risk-high/50 bg-risk-high/10" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{step.label}</span>
                    <span className="font-mono text-sm">{Math.round(step.probability * 100)}%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
                  <div className="mt-2">
                    <Meter value={step.probability * 100} level={step.triggered ? "HIGH" : "LOW"} />
                  </div>
                </div>
                {i < a.cascade_chain.length - 1 && (
                  <div className="flex justify-center py-1 text-muted-foreground">
                    <ArrowDown className="size-4" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="Cascade summary" right={<RiskBadge level={a.risk_level} score={a.risk_score} />}>
            <dl className="space-y-2 text-sm">
              {[
                ["Primary hazard", a.primary_hazard.replace("_", " ")],
                ["Secondary hazard", a.secondary_hazard?.replace("_", " ") ?? "—"],
                ["Cascade probability", `${Math.round(a.cascade_probability * 100)}%`],
                ["Affected area", `${a.affected_area_km2} km²`],
                ["Population exposure", a.population_exposed.toLocaleString("en-IN")],
                ["Infrastructure exposure", String(a.infrastructure_exposed)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/50 pb-1.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-md border border-border bg-muted/40 p-2 text-sm">
              Recommended action: <b>{a.recommended_action}</b>
            </p>
          </Panel>

          <Panel title="Overall risk composition">
            <p className="text-sm text-muted-foreground">
              PRIMARY HAZARD + SECONDARY HAZARD + CASCADE RISK + EXPOSURE = OVERALL DISASTER RISK
            </p>
            <div className="mt-3 space-y-2">
              {a.factors.map((f) => (
                <div key={f.factor}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{f.factor}</span>
                    <span className="font-mono">{f.contribution}%</span>
                  </div>
                  <Meter value={f.contribution * 2.5} level={a.risk_level} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
