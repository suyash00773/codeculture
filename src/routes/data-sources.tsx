import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pravaah/head";
import { DATA_SOURCES } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel } from "@/components/pravaah/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/data-sources")({
  head: pageHead(
    "Data Sources",
    "Transparency dashboard: exactly which feeds are demo, referenced or genuinely connected in this prototype.",
  ),
  component: DataSourcesPage,
});

const statusClass: Record<string, string> = {
  DEMO: "border-risk-moderate/40 bg-risk-moderate/10 text-risk-moderate",
  INTEGRATION_PLANNED: "border-border bg-muted text-muted-foreground",
  REFERENCE: "border-border bg-muted text-muted-foreground",
  CONNECTED: "border-risk-low/40 bg-risk-low/10 text-risk-low",
};

function DataSourcesPage() {
  return (
    <>
      <PageHeader
        title="Data Sources"
        subtitle="Honesty layer. Every number in PRAVAAH traces back to one of these entries — nothing here claims a live government feed that does not exist."
      />
      <DemoBanner text="No live government or commercial data feed is connected. All observations are synthetic." />

      <div className="grid gap-3 md:grid-cols-2">
        {DATA_SOURCES.map((s) => (
          <Panel key={s.name}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.organisation}</p>
              </div>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 font-mono text-[11px]",
                  statusClass[s.status],
                )}
              >
                {s.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-sm">{s.data_type}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>
            <p className="label-mono mt-2">Last updated: {s.last_updated}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Integration path">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <b className="text-foreground">WeatherProvider</b> — implement the interface against IMD or
            another meteorological API; the risk engine needs no changes.
          </li>
          <li>
            <b className="text-foreground">SatelliteProvider</b> — supply real scenes and a change-detection
            score to replace the placeholder panels.
          </li>
          <li>
            <b className="text-foreground">Alert dispatch</b> — alerts are drafted but never sent. A real
            deployment would route them through NDMA SACHET / CAP-compliant channels with human sign-off.
          </li>
        </ul>
      </Panel>
    </>
  );
}
