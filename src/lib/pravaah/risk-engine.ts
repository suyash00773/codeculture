import { DISTRICTS, INFRASTRUCTURE } from "./demo-data";
import type {
  CascadeStep,
  DistrictLocation,
  FactorContribution,
  HazardType,
  LocationSignals,
  RiskAssessment,
  RiskLevel,
  RiskWeights,
} from "./types";

export const MODEL_VERSION = "prototype-risk-model-v0.3";

/**
 * Prototype Risk Model weights (NOT scientifically validated).
 * Configurable from Settings → Risk Model.
 */
export const DEFAULT_WEIGHTS: RiskWeights = {
  rainfall: 0.25,
  soil_moisture: 0.15,
  river_level: 0.2,
  terrain: 0.15,
  historical: 0.1,
  population: 0.1,
  infrastructure: 0.05,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pct = (v: number) => Math.round(clamp01(v) * 100);

export function riskLevelFromScore(score: number): RiskLevel {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MODERATE";
  if (score <= 75) return "HIGH";
  return "EXTREME";
}

export const RISK_LEVEL_ORDER: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "EXTREME"];

/** Normalised 0–1 feature values used by both the score and the explanation. */
function normalise(s: LocationSignals) {
  return {
    rainfall: clamp01(s.rainfall_mm_24h / 250),
    soil_moisture: clamp01(s.soil_moisture_pct / 100),
    river_level: clamp01(s.river_level_pct / 100),
    terrain: clamp01(s.slope_deg / 45),
    historical: clamp01(s.historical_events / 20),
    population: clamp01(Math.log10(1 + s.population_density) / Math.log10(1001)),
    infrastructure: clamp01(s.infrastructure_density / 100),
  };
}

const FACTOR_LABELS: Record<keyof RiskWeights, string> = {
  rainfall: "Rainfall (24h)",
  soil_moisture: "Soil moisture",
  river_level: "River level",
  terrain: "Terrain / slope",
  historical: "Historical hazard activity",
  population: "Population exposure",
  infrastructure: "Infrastructure exposure",
};

function factorValues(s: LocationSignals): Record<keyof RiskWeights, string> {
  return {
    rainfall: `${Math.round(s.rainfall_mm_24h)} mm`,
    soil_moisture: `${Math.round(s.soil_moisture_pct)}%`,
    river_level: `${Math.round(s.river_level_pct)}% of danger mark`,
    terrain: `${Math.round(s.slope_deg)}° mean slope`,
    historical: `${s.historical_events} recorded events`,
    population: `${Math.round(s.population_density)} people/km²`,
    infrastructure: `${Math.round(s.infrastructure_density)} index`,
  };
}

/** Hazard-specific probabilities from the same normalised signals. */
export function hazardProbabilities(s: LocationSignals) {
  const n = normalise(s);
  const landslide = clamp01(
    0.45 * n.rainfall + 0.25 * n.soil_moisture + 0.2 * n.terrain + 0.1 * n.historical,
  );
  const flood = clamp01(
    0.35 * n.river_level + 0.3 * n.rainfall + 0.2 * n.soil_moisture + 0.15 * n.historical,
  );
  const flash_flood = clamp01(0.5 * n.rainfall + 0.25 * n.terrain + 0.25 * n.river_level);
  const cloudburst = clamp01(0.7 * n.rainfall + 0.3 * n.terrain) * 0.8;
  const avalanche = clamp01(0.6 * clamp01(s.snowpack_index) + 0.4 * n.terrain);
  const glof = clamp01(
    0.45 * clamp01(s.snowpack_index) + 0.3 * n.river_level + 0.25 * clamp01(s.elevation_m / 4000),
  );
  return { landslide, flood, flash_flood, cloudburst, avalanche, glof };
}

/**
 * Cascade engine — modular rule chain.
 * Each step's probability is conditioned on the previous step, so the chain
 * can later be swapped for a trained graph/ML model without touching the UI.
 */
export function cascadeChain(s: LocationSignals, populationExposed: number): CascadeStep[] {
  const p = hazardProbabilities(s);
  const rainTrigger = clamp01(s.rainfall_mm_24h / 200);
  const saturation = clamp01((s.soil_moisture_pct - 45) / 45) * (0.5 + 0.5 * rainTrigger);
  const slopeInstability = clamp01(saturation * clamp01(s.slope_deg / 40) * 1.15);
  const landslide = clamp01(0.6 * slopeInstability + 0.4 * p.landslide);
  const blockage = clamp01(landslide * (0.4 + 0.6 * clamp01(s.river_blockage_index)));
  const downstream = clamp01(0.55 * blockage + 0.45 * p.flash_flood * clamp01(s.river_level_pct / 100));
  const exposure = clamp01(downstream * clamp01(Math.log10(1 + populationExposed) / 5.5) * 1.3);

  const steps: Array<[string, string, number, string]> = [
    ["rain", "Heavy rainfall", rainTrigger, `${Math.round(s.rainfall_mm_24h)} mm in 24h`],
    ["soil", "Soil saturation", saturation, `Soil moisture ${Math.round(s.soil_moisture_pct)}%`],
    ["slope", "Slope instability", slopeInstability, `Mean slope ${Math.round(s.slope_deg)}°`],
    ["landslide", "Landslide probability", landslide, "Debris-flow initiation on saturated slopes"],
    ["blockage", "River blockage", blockage, `Channel blockage index ${s.river_blockage_index.toFixed(2)}`],
    ["flood", "Downstream flash flood", downstream, `River at ${Math.round(s.river_level_pct)}% of danger mark`],
    ["exposure", "Population exposure", exposure, `${populationExposed.toLocaleString("en-IN")} people in modelled footprint`],
  ];

  return steps.map(([id, label, probability, detail]) => ({
    id,
    label,
    probability: clamp01(probability),
    detail,
    triggered: probability >= 0.5,
  }));
}

function recommendedAction(level: RiskLevel): string {
  switch (level) {
    case "EXTREME":
      return "EVACUATION PREPARATION";
    case "HIGH":
      return "PRE-POSITION RESPONSE TEAMS";
    case "MODERATE":
      return "HEIGHTENED MONITORING";
    default:
      return "ROUTINE MONITORING";
  }
}

function responsePlan(level: RiskLevel, primary: HazardType): string[] {
  const base = [
    "Publish a SIMULATION alert to the district dashboard and citizen view.",
    "Confirm shelter capacity and stock levels at designated relief centres.",
  ];
  if (level === "EXTREME") {
    return [
      "Initiate evacuation preparation for settlements inside the modelled footprint.",
      "Stage NDRF/SDRF teams at the nearest safe zone with boats and cutting equipment.",
      "Close identified high-risk road segments and activate safe-route diversions.",
      "Alert district hospitals to prepare surge capacity.",
      ...base,
    ];
  }
  if (level === "HIGH") {
    return [
      `Pre-position response teams for ${primary.toLowerCase().replace("_", " ")} operations.`,
      "Issue travel advisory for exposed road corridors during night hours.",
      "Increase observation frequency to 30-minute cycles.",
      ...base,
    ];
  }
  if (level === "MODERATE") {
    return [
      "Maintain hourly monitoring of rainfall and river-stage signals.",
      "Verify communication links with block-level officers.",
      ...base.slice(0, 1),
    ];
  }
  return ["Continue routine six-hourly monitoring.", "No response mobilisation required."];
}

export function assessLocation(
  district: DistrictLocation,
  weights: RiskWeights = DEFAULT_WEIGHTS,
  overrideSignals?: Partial<LocationSignals>,
): RiskAssessment {
  const s: LocationSignals = { ...district.signals, ...overrideSignals };
  const n = normalise(s);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const contributions = (Object.keys(weights) as Array<keyof RiskWeights>).map((k) => ({
    key: k,
    raw: (weights[k] / totalWeight) * n[k],
  }));
  const baseScore = contributions.reduce((a, c) => a + c.raw, 0);

  const probs = hazardProbabilities(s);
  const infraCount = INFRASTRUCTURE.filter((i) => i.district_id === district.id).length;
  const areaFactor = clamp01(Math.max(...Object.values(probs)));
  const affected_area_km2 = Math.round(Math.PI * district.radius_km ** 2 * (0.25 + 0.6 * areaFactor));
  const population_exposed = Math.round(
    district.population * (0.05 + 0.35 * areaFactor) * (0.6 + 0.4 * n.population),
  );

  const chain = cascadeChain(s, population_exposed);
  const cascade_probability = chain[chain.length - 1]!.probability;

  const risk_score = Math.round(clamp01(baseScore * 0.78 + cascade_probability * 0.22) * 100);
  const risk_level = riskLevelFromScore(risk_score);

  const ranked = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  const hazardName = (k: string): HazardType =>
    ({
      landslide: "LANDSLIDE",
      flood: "FLOOD",
      flash_flood: "FLASH_FLOOD",
      cloudburst: "CLOUDBURST",
      avalanche: "AVALANCHE",
      glof: "GLOF",
    })[k] as HazardType;

  const values = factorValues(s);
  const contribTotal = contributions.reduce((a, c) => a + c.raw, 0) || 1;
  const factors: FactorContribution[] = contributions
    .map((c) => ({
      factor: FACTOR_LABELS[c.key],
      contribution: Math.round((c.raw / contribTotal) * 100),
      value: values[c.key],
    }))
    .sort((a, b) => b.contribution - a.contribution);

  // Confidence reflects signal completeness/agreement, not real-world accuracy.
  const spread = Math.abs(ranked[0]![1] - ranked[1]![1]);
  const confidence = Number((0.62 + 0.25 * spread + 0.1 * clamp01(n.historical)).toFixed(2));

  return {
    location_id: district.id,
    location_name: district.name,
    state: district.state,
    risk_score,
    risk_level,
    hazard_probabilities: Object.fromEntries(
      Object.entries(probs).map(([k, v]) => [k, Number(v.toFixed(2))]),
    ),
    primary_hazard: hazardName(ranked[0]![0]),
    secondary_hazard: ranked[1] ? hazardName(ranked[1][0]) : null,
    cascade_probability: Number(cascade_probability.toFixed(2)),
    cascade_chain: chain,
    confidence: Math.min(confidence, 0.9),
    factors,
    population_exposed,
    infrastructure_exposed: infraCount,
    affected_area_km2,
    recommended_action: recommendedAction(risk_level),
    recommended_response: responsePlan(risk_level, hazardName(ranked[0]![0])),
    model_version: MODEL_VERSION,
    is_demo: true,
    generated_at: new Date().toISOString(),
  };
}

export function assessAll(weights: RiskWeights = DEFAULT_WEIGHTS): RiskAssessment[] {
  return DISTRICTS.map((d) => assessLocation(d, weights)).sort((a, b) => b.risk_score - a.risk_score);
}

export const percent = pct;
