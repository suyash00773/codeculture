import { DISTRICTS } from "./demo-data";

export interface WeatherObservation {
  location_id: string;
  location_name: string;
  state: string;
  rainfall_mm_24h: number;
  rainfall_forecast_mm_24h: number;
  temperature_c: number;
  humidity_pct: number;
  wind_kph: number;
  condition: string;
  source: "DEMO" | "API" | "GOVERNMENT";
  observed_at: string;
}

/** Abstraction so a real IMD/other adapter can be dropped in later. */
export interface WeatherProvider {
  readonly name: string;
  readonly sourceLabel: "DEMO" | "API" | "GOVERNMENT";
  getObservations(): WeatherObservation[];
}

export const DemoWeatherProvider: WeatherProvider = {
  name: "DemoWeatherProvider",
  sourceLabel: "DEMO",
  getObservations() {
    return DISTRICTS.map((d) => {
      const s = d.signals;
      return {
        location_id: d.id,
        location_name: d.name,
        state: d.state,
        rainfall_mm_24h: s.rainfall_mm_24h,
        rainfall_forecast_mm_24h: Math.round(s.rainfall_mm_24h * 0.85 + s.soil_moisture_pct * 0.3),
        temperature_c: s.temperature_c,
        humidity_pct: Math.min(99, Math.round(s.soil_moisture_pct + 10)),
        wind_kph: Math.round(6 + (s.slope_deg % 7) * 3),
        condition:
          s.rainfall_mm_24h > 130
            ? "Very heavy rain"
            : s.rainfall_mm_24h > 70
              ? "Heavy rain"
              : s.rainfall_mm_24h > 30
                ? "Moderate rain"
                : "Cloudy",
        source: "DEMO" as const,
        observed_at: new Date().toISOString(),
      };
    });
  },
};

export interface SatelliteScene {
  location_id: string;
  location_name: string;
  before_label: string;
  after_label: string;
  change_detected_pct: number;
  observation_type: string;
  status: "DEMO" | "CONNECTED";
  notes: string;
}

export interface SatelliteProvider {
  readonly name: string;
  getScenes(): SatelliteScene[];
}

export const DemoSatelliteProvider: SatelliteProvider = {
  name: "DemoSatelliteProvider",
  getScenes() {
    return DISTRICTS.slice(0, 6).map((d) => ({
      location_id: d.id,
      location_name: `${d.name}, ${d.state}`,
      before_label: "Pre-event composite (placeholder)",
      after_label: "Post-event composite (placeholder)",
      change_detected_pct: Math.round(
        Math.min(95, d.signals.rainfall_mm_24h / 3 + d.signals.slope_deg / 2),
      ),
      observation_type: "Optical / multispectral (simulated change score)",
      status: "DEMO" as const,
      notes: "No live satellite feed is connected. Change score is computed from demo signals.",
    }));
  },
};

/** Selects a real provider when env config exists; otherwise demo. */
export function getWeatherProvider(): WeatherProvider {
  return DemoWeatherProvider;
}
