/**
 * Demo safe-route planner.
 * Dijkstra over a small hand-built road graph; edges that fall inside a
 * high-risk polygon are penalised (effectively avoided).
 */
export interface RouteNode {
  id: string;
  name: string;
  type: "SETTLEMENT" | "JUNCTION" | "SHELTER" | "HOSPITAL";
  lat: number;
  lng: number;
  district_id: string;
}

export interface RouteEdge {
  from: string;
  to: string;
  km: number;
  risk: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  name: string;
}

export const ROUTE_NODES: RouteNode[] = [
  { id: "n1", name: "Joshimath settlement", type: "SETTLEMENT", lat: 30.55, lng: 79.56, district_id: "utk-chamoli" },
  { id: "n2", name: "Helang junction", type: "JUNCTION", lat: 30.49, lng: 79.49, district_id: "utk-chamoli" },
  { id: "n3", name: "Pipalkoti junction", type: "JUNCTION", lat: 30.43, lng: 79.42, district_id: "utk-chamoli" },
  { id: "n4", name: "Chamoli ridge bypass", type: "JUNCTION", lat: 30.46, lng: 79.36, district_id: "utk-chamoli" },
  { id: "n5", name: "Gopeshwar relief shelter", type: "SHELTER", lat: 30.4, lng: 79.31, district_id: "utk-chamoli" },
  { id: "n6", name: "District Hospital Gopeshwar", type: "HOSPITAL", lat: 30.41, lng: 79.33, district_id: "utk-chamoli" },
  { id: "n7", name: "Silapathar settlement", type: "SETTLEMENT", lat: 27.51, lng: 94.62, district_id: "as-dhemaji" },
  { id: "n8", name: "Dhemaji embankment junction", type: "JUNCTION", lat: 27.46, lng: 94.6, district_id: "as-dhemaji" },
  { id: "n9", name: "Dhemaji relief shelter", type: "SHELTER", lat: 27.48, lng: 94.55, district_id: "as-dhemaji" },
];

export const ROUTE_EDGES: RouteEdge[] = [
  { from: "n1", to: "n2", km: 12, risk: "EXTREME", name: "Valley-floor highway (debris-flow corridor)" },
  { from: "n1", to: "n4", km: 19, risk: "MODERATE", name: "Upper ridge track" },
  { from: "n2", to: "n3", km: 9, risk: "HIGH", name: "River-side stretch" },
  { from: "n3", to: "n5", km: 8, risk: "LOW", name: "Gopeshwar approach road" },
  { from: "n4", to: "n5", km: 11, risk: "LOW", name: "Ridge descent road" },
  { from: "n5", to: "n6", km: 2, risk: "LOW", name: "Shelter–hospital link" },
  { from: "n7", to: "n8", km: 7, risk: "HIGH", name: "Embankment road (seepage reported)" },
  { from: "n7", to: "n9", km: 13, risk: "MODERATE", name: "Northern detour" },
  { from: "n8", to: "n9", km: 6, risk: "LOW", name: "Shelter access road" },
];

const RISK_PENALTY = { LOW: 1, MODERATE: 1.6, HIGH: 4, EXTREME: 12 } as const;

export function planSafeRoute(startId: string, goalId: string) {
  const dist = new Map<string, number>();
  const prev = new Map<string, { node: string; edge: RouteEdge }>();
  const visited = new Set<string>();
  ROUTE_NODES.forEach((n) => dist.set(n.id, Infinity));
  dist.set(startId, 0);

  while (visited.size < ROUTE_NODES.length) {
    let current: string | null = null;
    let best = Infinity;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < best) {
        best = d;
        current = id;
      }
    }
    if (current === null) break;
    visited.add(current);
    if (current === goalId) break;

    for (const e of ROUTE_EDGES) {
      const neighbour = e.from === current ? e.to : e.to === current ? e.from : null;
      if (!neighbour || visited.has(neighbour)) continue;
      const cost = best + e.km * RISK_PENALTY[e.risk];
      if (cost < (dist.get(neighbour) ?? Infinity)) {
        dist.set(neighbour, cost);
        prev.set(neighbour, { node: current, edge: e });
      }
    }
  }

  const path: RouteEdge[] = [];
  const nodes: string[] = [goalId];
  let cursor = goalId;
  while (cursor !== startId) {
    const step = prev.get(cursor);
    if (!step) return null;
    path.unshift(step.edge);
    nodes.unshift(step.node);
    cursor = step.node;
  }
  return {
    edges: path,
    nodes: nodes.map((id) => ROUTE_NODES.find((n) => n.id === id)!),
    distance_km: path.reduce((a, e) => a + e.km, 0),
    max_segment_risk: path.reduce<RouteEdge["risk"]>(
      (a, e) => (RISK_PENALTY[e.risk] > RISK_PENALTY[a] ? e.risk : a),
      "LOW",
    ),
  };
}

export function nodeById(id: string) {
  return ROUTE_NODES.find((n) => n.id === id);
}
