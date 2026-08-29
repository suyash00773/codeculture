import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pravaah/head";
import { DemoSatelliteProvider } from "@/lib/pravaah/providers";
import { DemoBanner, Meter, PageHeader, Panel } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/satellite")({
  head: pageHead(
    "Satellite",
    "Satellite change-detection module with before/after comparison placeholders and a swappable SatelliteProvider abstraction.",
  ),
  component: SatellitePage,
});

function SatellitePage() {
  const scenes = DemoSatelliteProvider.getScenes();

  return (
    <>
      <PageHeader
        title="Satellite"
        subtitle="Change detection and terrain comparison. Imagery panels are placeholders — no live satellite feed exists in this prototype."
      />
      <DemoBanner text="No ISRO/Bhuvan, Sentinel or commercial imagery feed is connected. Change scores are computed from demo signals." />

      <div className="grid gap-4 md:grid-cols-2">
        {scenes.map((s) => (
          <Panel key={s.location_id} title={s.location_name}>
            <div className="grid grid-cols-2 gap-2">
              {[s.before_label, s.after_label].map((label) => (
                <div
                  key={label}
                  className="grid h-32 place-items-center rounded-md border border-dashed border-border bg-muted/40 p-2 text-center text-xs text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change detected</span>
                <span className="font-mono">{s.change_detected_pct}%</span>
              </div>
              <Meter value={s.change_detected_pct} level={s.change_detected_pct > 60 ? "HIGH" : "MODERATE"} />
              <p className="mt-2 text-xs text-muted-foreground">{s.observation_type}</p>
              <p className="text-xs text-risk-moderate">{s.notes}</p>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
