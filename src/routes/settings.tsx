import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { DEFAULT_WEIGHTS, assessAll } from "@/lib/pravaah/risk-engine";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import type { RiskWeights } from "@/lib/pravaah/types";

export const Route = createFileRoute("/settings")({
  head: pageHead(
    "Settings",
    "Tune risk-engine factor weights and alert thresholds, and watch district scores respond live.",
  ),
  component: SettingsPage,
});

function SettingsPage() {
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [threshold, setThreshold] = useState(70);
  const baseline = useMemo(() => assessAll(DEFAULT_WEIGHTS), []);
  const tuned = useMemo(() => assessAll(weights), [weights]);
  const total = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Weight changes apply instantly to the assessments below. They are session-only and are not persisted."
        actions={
          <button
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
          >
            Reset to defaults
          </button>
        }
      />
      <DemoBanner text="Configuration is not persisted in this prototype. Reloading restores default weights." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`Risk factor weights (sum ${total.toFixed(2)})`}>
          <div className="space-y-3">
            {(Object.keys(weights) as Array<keyof RiskWeights>).map((k) => (
              <label key={String(k)} className="block text-sm">
                <span className="flex justify-between">
                  <span className="capitalize">{String(k).replace(/_/g, " ")}</span>
                  <span className="font-mono">{Number(weights[k]).toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={Number(weights[k])}
                  onChange={(e) =>
                    setWeights((w) => ({ ...w, [k]: Number(e.target.value) }) as RiskWeights)
                  }
                  className="mt-1 w-full accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Alerting">
          <label className="block text-sm">
            <span className="flex justify-between">
              <span>Auto-alert risk threshold</span>
              <span className="font-mono">{threshold}</span>
            </span>
            <input
              type="range"
              min={30}
              max={95}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--primary)]"
            />
          </label>
          <p className="mt-2 text-sm text-muted-foreground">
            {tuned.filter((t) => t.risk_score >= threshold).length} district(s) would trigger an automatic
            alert draft at this threshold. Drafts always require human sign-off before dispatch.
          </p>
        </Panel>
      </div>

      <Panel title="Impact of your weights">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["District", "Baseline", "Tuned", "Δ", "Level"].map((h) => (
                  <th key={h} className="label-mono py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tuned.map((t) => {
                const b = baseline.find((x) => x.location_id === t.location_id)!;
                const delta = t.risk_score - b.risk_score;
                return (
                  <tr key={t.location_id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4">{t.location_name}</td>
                    <td className="py-2 pr-4 font-mono">{b.risk_score}</td>
                    <td className="py-2 pr-4 font-mono">{t.risk_score}</td>
                    <td className="py-2 pr-4 font-mono">
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </td>
                    <td className="py-2 pr-4"><RiskBadge level={t.risk_level} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
