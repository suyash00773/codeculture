import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { HISTORICAL_EVENTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/historical-events")({
  head: pageHead(
    "Historical Events",
    "Archive of past Himalayan and Northeast Indian disasters used to calibrate and sanity-check the risk model.",
  ),
  component: HistoricalEventsPage,
});

function HistoricalEventsPage() {
  const [q, setQ] = useState("");
  const events = [...HISTORICAL_EVENTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((e) =>
      `${e.location} ${e.state} ${e.event_type} ${e.description}`.toLowerCase().includes(q.toLowerCase()),
    );

  return (
    <>
      <PageHeader
        title="Historical Events"
        subtitle="Reference record of documented disasters. Figures are approximate and compiled from public reporting."
        actions={
          <input
            className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
            placeholder="Search events…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      />
      <DemoBanner text="Historical figures are approximate, compiled from public reporting for prototype context." />

      <div className="space-y-3">
        {events.map((e) => (
          <Panel key={e.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="label-mono">
                  {new Date(e.date).toLocaleDateString("en-IN", { dateStyle: "medium" })} ·{" "}
                  {e.event_type.replace("_", " ")}
                </p>
                <h3 className="mt-0.5 font-semibold">
                  {e.location}, {e.state}
                </h3>
              </div>
              <RiskBadge level={e.severity} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ["Fatalities", e.fatalities?.toLocaleString("en-IN") ?? "Not recorded"],
                ["Affected", e.affected_population?.toLocaleString("en-IN") ?? "Not recorded"],
                ["Rainfall", e.rainfall_mm ? `${e.rainfall_mm} mm` : "Not recorded"],
                ["Source", e.source],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-border bg-muted/30 p-2">
                  <p className="label-mono">{k}</p>
                  <p className="mt-0.5 font-mono">{v}</p>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
