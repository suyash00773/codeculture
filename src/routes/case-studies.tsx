import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pravaah/head";
import { DemoBanner, PageHeader, Panel } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/case-studies")({
  head: pageHead(
    "Case Studies",
    "Worked cascade case studies — Nepal 2024 floods, Chamoli 2021 and Sikkim 2023 — showing how PRAVAAH would have reasoned.",
  ),
  component: CaseStudiesPage,
});

const CASES = [
  {
    title: "Nepal / Eastern Himalaya floods, September 2024",
    summary:
      "Sustained monsoon rainfall over saturated terrain produced simultaneous landslides and river flooding, cutting highways and isolating settlements.",
    chain: [
      "Extreme multi-day rainfall",
      "Soil saturation exceeds retention capacity",
      "Slope failures across highway corridors",
      "Debris blocks river channels",
      "Sudden release → downstream flash flooding",
      "Road and bridge loss isolates relief access",
    ],
    lesson:
      "The deadliest impacts came from the chain, not the rain. A model that only alerts on rainfall thresholds misses the isolation risk entirely.",
    pravaah:
      "PRAVAAH's cascade engine would have raised a secondary flash-flood probability once slope failure probability crossed its threshold, and flagged single-access districts for pre-emptive evacuation.",
  },
  {
    title: "Chamoli rock-ice avalanche, February 2021",
    summary:
      "A rock and ice mass detached in the Rishiganga catchment, generating a debris flow that destroyed hydropower infrastructure downstream.",
    chain: [
      "Rock-ice detachment at high elevation",
      "Debris flow gains volume in steep valley",
      "Hydropower barrage and tunnels overwhelmed",
      "Downstream worker and settlement exposure",
    ],
    lesson:
      "Non-monsoon, non-rainfall triggers matter in glaciated terrain. Terrain and cryosphere state must be first-class model inputs.",
    pravaah:
      "The engine treats slope, elevation and glacial-lake proximity as standing vulnerability factors, so such catchments retain elevated baseline risk even in dry weather.",
  },
  {
    title: "South Lhonak GLOF, Sikkim, October 2023",
    summary:
      "A glacial lake outburst sent a flood wave down the Teesta, damaging the Chungthang dam and downstream towns within hours.",
    chain: [
      "Glacial lake moraine failure",
      "Outburst flood wave down the Teesta",
      "Dam overtopping and structural damage",
      "Compounded downstream flooding and road loss",
    ],
    lesson:
      "Lead time was minutes to hours. Value comes from pre-computed downstream exposure and evacuation routing, not from a faster alert alone.",
    pravaah:
      "Exposure and safe-route layers are computed continuously, so a GLOF trigger immediately resolves to named shelters and risk-weighted routes.",
  },
];

function CaseStudiesPage() {
  return (
    <>
      <PageHeader
        title="Case Studies"
        subtitle="How the cascade model reasons about real, documented events. Descriptions are summarised from public reporting."
      />
      <DemoBanner text="Case study analysis is retrospective and illustrative — PRAVAAH did not operate during these events." />

      <div className="space-y-4">
        {CASES.map((c) => (
          <Panel key={c.title} title={c.title}>
            <p className="text-sm text-muted-foreground">{c.summary}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="label-mono mb-2">Observed cascade chain</p>
                <ol className="space-y-1.5">
                  {c.chain.map((step, i) => (
                    <li key={step} className="flex gap-2 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[11px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3">
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="label-mono mb-1">Lesson</p>
                  <p className="text-sm">{c.lesson}</p>
                </div>
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
                  <p className="label-mono mb-1">How PRAVAAH would respond</p>
                  <p className="text-sm">{c.pravaah}</p>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
