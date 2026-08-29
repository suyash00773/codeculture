import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { INCIDENTS } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel, RiskBadge } from "@/components/pravaah/primitives";
import type { Incident } from "@/lib/pravaah/types";

export const Route = createFileRoute("/incidents")({
  head: pageHead(
    "Incidents",
    "Field incident register for response teams: hazard type, severity, assigned teams and live response status.",
  ),
  component: IncidentsPage,
});

const STATUSES: Incident["status"][] = ["REPORTED", "RESPONDING", "CONTAINED", "CLOSED"];

function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [filter, setFilter] = useState("ALL");
  const shown = incidents.filter((i) => filter === "ALL" || i.status === filter);

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Response teams update status here. Status changes are local to this prototype session and are logged to the audit trail concept."
        actions={
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["ALL", ...STATUSES].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />
      <DemoBanner />

      {shown.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">No incidents match this filter.</p>
        </Panel>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((i) => (
            <Panel key={i.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="label-mono">{i.hazard_type.replace("_", " ")}</p>
                  <h3 className="mt-1 font-semibold">{i.title}</h3>
                  <p className="text-sm text-muted-foreground">{i.location}</p>
                </div>
                <RiskBadge level={i.severity} />
              </div>
              <p className="mt-2 text-sm">{i.notes}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Reported {new Date(i.reported_at).toLocaleString()}</span>
                <span>· {i.teams_assigned} team(s)</span>
                <select
                  className="ml-auto rounded-md border border-input bg-background px-2 py-1 text-xs"
                  value={i.status}
                  onChange={(e) =>
                    setIncidents((prev) =>
                      prev.map((x) =>
                        x.id === i.id ? { ...x, status: e.target.value as Incident["status"] } : x,
                      ),
                    )
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
