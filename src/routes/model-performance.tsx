import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { DEFAULT_WEIGHTS, MODEL_VERSION, assessAll } from "@/lib/pravaah/risk-engine";
import { DemoBanner, KpiCard, Meter, PageHeader, Panel } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/model-performance")({
  head: pageHead(
    "Model Performance",
    "What the PRAVAAH prototype model is, how it scores risk, and the limitations you must account for before acting on it.",
  ),
  component: ModelPerformancePage,
});

function ModelPerformancePage() {
  const all = useMemo(() => assessAll(), []);
  const avgConfidence = Math.round((all.reduce((a, x) => a + x.confidence, 0) / all.length) * 100);

  return (
    <>
      <PageHeader
        title="Model Performance"
        subtitle="Transparency about the model behind every score in this application."
      />
      <DemoBanner text="This is a deterministic, explainable prototype model. It has NOT been validated against ground truth and must not be used operationally." />

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Model version" value={MODEL_VERSION} />
        <KpiCard label="Average confidence" value={`${avgConfidence}%`} />
        <KpiCard label="Validated accuracy" value="Not established" tone="EXTREME" hint="No ground-truth backtest has been run" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Factor weights">
          <ul className="space-y-2.5 text-sm">
            {Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => (
              <li key={k}>
                <div className="flex justify-between">
                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="font-mono">{Math.round(Number(v) * 100)}%</span>
                </div>
                <Meter value={Number(v) * 100} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="How scoring works">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Each district's signals are normalised to a 0–100 scale.</li>
            <li>Normalised signals are combined with the weights on the left into a single risk score.</li>
            <li>Score bands map to LOW / MODERATE / HIGH / EXTREME levels.</li>
            <li>Hazard-specific probabilities are derived from the same signals.</li>
            <li>
              The cascade engine propagates a primary hazard into secondary hazards using documented
              physical relationships, decaying probability at each step.
            </li>
            <li>Exposure multiplies the modelled footprint by population and asset density.</li>
          </ol>
        </Panel>
      </div>

      <Panel title="Limitations you must know">
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li>All input observations are synthetic. No live meteorological, hydrological or satellite feed is connected.</li>
          <li>The model is rule-based and weighted, not a trained statistical or deep-learning model.</li>
          <li>No skill scores, ROC/AUC, false-alarm rate or lead-time metrics exist because no backtest has been performed.</li>
          <li>Cascade probabilities are plausible orderings of physical processes, not calibrated conditional probabilities.</li>
          <li>Population and infrastructure figures are approximate demo values, not census or asset-registry data.</li>
          <li>Outputs are decision-support estimates. Every alert in this prototype is marked as a simulation and none are dispatched.</li>
        </ul>
      </Panel>
    </>
  );
}
