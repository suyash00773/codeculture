export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME";

export type HazardType =
  | "FLOOD"
  | "FLASH_FLOOD"
  | "LANDSLIDE"
  | "CLOUDBURST"
  | "AVALANCHE"
  | "GLOF"
  | "CYCLONE"
  | "HEATWAVE"
  | "DROUGHT"
  | "EARTHQUAKE"
  | "MULTI_HAZARD";

export type AlertLevel = "INFO" | "ADVISORY" | "WATCH" | "WARNING" | "EMERGENCY";

export type Role = "ADMIN" | "AUTHORITY" | "RESPONSE_TEAM" | "ANALYST" | "CITIZEN";

/** Raw observation bundle for one location (demo/simulated values). */
export interface LocationSignals {
  rainfall_mm_24h: number;
  soil_moisture_pct: number;
  river_level_pct: number;
  slope_deg: number;
  elevation_m: number;
  historical_events: number;
  temperature_c: number;
  population_density: number;
  infrastructure_density: number;
  river_blockage_index: number;
  snowpack_index: number;
}

export interface DistrictLocation {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  radius_km: number;
  primary_hazards: HazardType[];
  signals: LocationSignals;
  is_demo: true;
}

export interface RiskWeights {
  rainfall: number;
  soil_moisture: number;
  river_level: number;
  terrain: number;
  historical: number;
  population: number;
  infrastructure: number;
}

export interface FactorContribution {
  factor: string;
  contribution: number; // 0-100 share of the score
  value: string;
}

export interface CascadeStep {
  id: string;
  label: string;
  probability: number; // 0-1
  detail: string;
  triggered: boolean;
}

export interface RiskAssessment {
  location_id: string;
  location_name: string;
  state: string;
  risk_score: number;
  risk_level: RiskLevel;
  hazard_probabilities: Record<string, number>;
  primary_hazard: HazardType;
  secondary_hazard: HazardType | null;
  cascade_probability: number;
  cascade_chain: CascadeStep[];
  confidence: number;
  factors: FactorContribution[];
  population_exposed: number;
  infrastructure_exposed: number;
  affected_area_km2: number;
  recommended_action: string;
  recommended_response: string[];
  model_version: string;
  is_demo: true;
  generated_at: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  type:
    | "HOSPITAL"
    | "SCHOOL"
    | "BRIDGE"
    | "ROAD"
    | "RAILWAY"
    | "POWER"
    | "SHELTER"
    | "POLICE"
    | "FIRE";
  district_id: string;
  lat: number;
  lng: number;
  status: "OPERATIONAL" | "AT_RISK" | "DISRUPTED";
  population_served: number;
  is_demo: true;
}

export interface DisasterEvent {
  id: string;
  event_type: HazardType;
  location: string;
  state: string;
  lat: number;
  lng: number;
  date: string;
  severity: RiskLevel;
  fatalities: number | null;
  affected_population: number | null;
  rainfall_mm: number | null;
  source: string;
  description: string;
  is_demo: boolean;
}

export interface Alert {
  id: string;
  title: string;
  hazard_type: HazardType;
  risk_level: RiskLevel;
  alert_level: AlertLevel;
  location: string;
  message: string;
  created_at: string;
  expires_at: string;
  status: "ACTIVE" | "EXPIRED" | "DRAFT";
  created_by: string;
  is_simulation: true;
}

export interface Incident {
  id: string;
  title: string;
  hazard_type: HazardType;
  location: string;
  reported_at: string;
  severity: RiskLevel;
  status: "REPORTED" | "RESPONDING" | "CONTAINED" | "CLOSED";
  teams_assigned: number;
  notes: string;
  is_demo: true;
}

export interface DataSourceStatus {
  name: string;
  organisation: string;
  data_type: string;
  status: "DEMO" | "INTEGRATION_PLANNED" | "REFERENCE" | "CONNECTED";
  last_updated: string;
  notes: string;
}
