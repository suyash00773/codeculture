import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import type { RiskAssessment } from "@/lib/pravaah/types";

const RiskMap = lazy(() => import("./RiskMap"));

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground"
      style={{ height }}
    >
      Loading risk map…
    </div>
  );
}

export function MapPanel(props: {
  assessments: RiskAssessment[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  height?: number;
  showInfrastructure?: boolean;
}) {
  const height = props.height ?? 520;
  return (
    <ClientOnly fallback={<Skeleton height={height} />}>
      <Suspense fallback={<Skeleton height={height} />}>
        <RiskMap {...props} height={height} />
      </Suspense>
    </ClientOnly>
  );
}
