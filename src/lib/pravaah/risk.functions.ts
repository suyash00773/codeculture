import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DISTRICTS } from "./demo-data";
import { DEFAULT_WEIGHTS, assessAll, assessLocation } from "./risk-engine";

const weightsSchema = z
  .object({
    rainfall: z.number(),
    soil_moisture: z.number(),
    river_level: z.number(),
    terrain: z.number(),
    historical: z.number(),
    population: z.number(),
    infrastructure: z.number(),
  })
  .optional();

const simulationSchema = z.object({
  location_id: z.string(),
  rainfall_mm_24h: z.number().min(0).max(600),
  soil_moisture_pct: z.number().min(0).max(100),
  river_level_pct: z.number().min(0).max(120),
  slope_deg: z.number().min(0).max(60),
  river_blockage_index: z.number().min(0).max(1),
  weights: weightsSchema,
});

/** GET /api/risk/current — risk assessment for every demo district. */
export const getCurrentRisk = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ weights: weightsSchema }).parse(input ?? {}))
  .handler(async ({ data }) => assessAll(data.weights ?? DEFAULT_WEIGHTS));

/** POST /api/simulation/run — re-runs the prototype model with user-supplied signals. */
export const runSimulation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => simulationSchema.parse(input))
  .handler(async ({ data }) => {
    const district = DISTRICTS.find((d) => d.id === data.location_id);
    if (!district) throw new Error(`Unknown location: ${data.location_id}`);
    const before = assessLocation(district, data.weights ?? DEFAULT_WEIGHTS);
    const after = assessLocation(district, data.weights ?? DEFAULT_WEIGHTS, {
      rainfall_mm_24h: data.rainfall_mm_24h,
      soil_moisture_pct: data.soil_moisture_pct,
      river_level_pct: data.river_level_pct,
      slope_deg: data.slope_deg,
      river_blockage_index: data.river_blockage_index,
    });
    return { before, after, run_at: new Date().toISOString(), is_simulation: true as const };
  });
