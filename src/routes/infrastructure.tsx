import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { DISTRICTS, INFRASTRUCTURE } from "@/lib/pravaah/demo-data";
import { assessAll } from "@/lib/pravaah/risk-engine";
import { planSafeRoute } from "@/lib/pravaah/routing";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/infrastructure")({
  head: pageHead(
    "Infrastructure",
    "Critical infrastructure layer: hospitals, bridges, roads, power and shelters with modelled risk level and operational status.",
  ),
  component: InfrastructurePage,
});

function InfrastructurePage() {
  const risk = useMemo(() => assessAll(), []);
  const [type, setType] = useState("ALL");
  const [selected, setSelected] = useState(INFRASTRUCTURE[0]!.id);
  const types = ["ALL", ...Array.from(new Set(INFRASTRUCTURE.map((i) => i.type)))];
  const list = INFRASTRUCTURE.filter((i) => type === "ALL" || i.type === type);
  const asset = INFRASTRUCTURE.find((i) => i.id === selected)!;
  const assetRisk = risk.find((r) => r.location_id === asset.district_id)!;
  const district = DISTRICTS.find((d) => d.id === asset.district_id)!;
  const route = planSafeRoute("n1", "n5");

  return (
    <>
      <PageHeader
        title="Infrastructure"
        subtitle="Assets are demo records positioned approximately. Risk level is inherited from the district assessment."
        actions={
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        }
      />
      <DemoBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={`Assets (${list.length})`} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Name", "Type", "District", "Status", "Served", "Risk"].map((h) => (
                    <th key={h} className="label-mono py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((i) => {
                  const r = risk.find((x) => x.location_id === i.district_id)!;
                  return (
                    <tr
                      key={i.id}
                      onClick={() => setSelected(i.id)}
                      className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary/50"
                    >
                      <td className="py-2 pr-4 font-medium">{i.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{i.type}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.location_name}</td>
                      <td className="py-2 pr-4">{i.status}</td>
                      <td className="py-2 pr-4 font-mono">{i.population_served.toLocaleString("en-IN")}</td>
                      <td className="py-2 pr-4"><RiskBadge level={r.risk_level} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Asset detail">
          <h3 className="font-semibold">{asset.name}</h3>
          <dl className="mt-3 space-y-1.5 text-sm">
            {[
              ["Type", asset.type],
              ["District", `${district.name}, ${district.state}`],
              ["Coordinates", `${asset.lat.toFixed(3)}, ${asset.lng.toFixed(3)}`],
              ["Risk level", assetRisk.risk_level],
              ["Current status", asset.status],
              ["Population served", asset.population_served.toLocaleString("en-IN")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-1">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 rounded-md border border-border bg-muted/40 p-2 text-xs">
            <p className="label-mono mb-1">Nearest safe route (demo graph)</p>
            {route ? (
              <p>
                {route.nodes.map((n) => n.name).join(" → ")} · {route.distance_km} km · max segment risk{" "}
                {route.max_segment_risk}
              </p>
            ) : (
              <p>No safe route available in the demo graph.</p>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
