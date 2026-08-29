# PRAVAAH AI

**Predictive Risk Assessment & Vulnerability Analysis for Automated Alerts and Hazards**

> Predict the risk. Understand the impact. Act before disaster strikes.

A decision-support prototype for **cascading disaster intelligence** in the Indian Himalaya and
Northeast. PRAVAAH does not just score a single hazard — it models how one hazard triggers the next
(rainfall → soil saturation → landslide → river blockage → flash flood → isolation) and resolves that
chain into exposure, evacuation and routing decisions.

## Honesty statement

This is a **prototype**. Every observation in the app is synthetic and every alert is marked as a
simulation and is never dispatched. No IMD, CWC, ISRO/Bhuvan or NDMA feed is connected. The risk model
is a deterministic, explainable weighted model — it has not been validated against ground truth and has
no published skill scores. See the in-app **Model Performance** and **Data Sources** pages.

## Feature map

| Area | Routes |
| --- | --- |
| Operations | `/` dashboard, `/live-map`, `/risk-analysis`, `/cascade-analysis`, `/incidents`, `/alerts` |
| Impact | `/exposure`, `/infrastructure`, `/evacuation`, `/safe-routes` |
| Intelligence | `/weather`, `/satellite`, `/historical-events`, `/analytics`, `/simulation`, `/case-studies` |
| Governance | `/data-sources`, `/model-performance`, `/settings`, `/admin/users` |
| Access | `/login` (demo role selection) |

## Architecture

- **Framework** — TanStack Start (React 19, SSR, file-based routing under `src/routes/`).
- **GIS** — Leaflet + react-leaflet, lazily loaded behind `ClientOnly` so SSR stays clean.
- **Charts** — Recharts.
- **Design system** — semantic OKLCH tokens in `src/styles.css`, including risk-level colours
  (`--risk-low/moderate/high/extreme`). Components never hardcode colours.

### Domain modules (`src/lib/pravaah/`)

| File | Responsibility |
| --- | --- |
| `types.ts` | Domain model: hazards, risk levels, assessments, alerts, incidents, assets. |
| `demo-data.ts` | Districts, infrastructure, historical events, alerts, incidents, data-source registry, demo users. |
| `risk-engine.ts` | Normalisation, weighted scoring, hazard probabilities, cascade propagation, exposure. |
| `routing.ts` | Risk-weighted Dijkstra over a demo road graph for safe-route planning. |
| `providers.ts` | `WeatherProvider` / `SatelliteProvider` interfaces + demo implementations. |
| `risk.functions.ts` | `createServerFn` endpoints: current risk overview and scenario simulation. |
| `head.ts` | Per-route SEO metadata helper. |

### Risk model

1. Signals (rainfall, soil moisture, slope, river level, seismic, deforestation, population density,
   infrastructure fragility) are normalised to 0–100.
2. A weighted sum yields a 0–100 risk score, banded into LOW / MODERATE / HIGH / EXTREME.
3. Hazard-specific probabilities are derived from the same signals.
4. The cascade engine propagates the primary hazard into secondary hazards with decaying probability.
5. Exposure multiplies the modelled footprint by population and asset density.

Weights are tunable live at `/settings`, which shows the score delta per district.

### Swapping in real data

Implement `WeatherProvider` (or `SatelliteProvider`) against a real API and return it from
`getWeatherProvider()`. The risk engine, UI and cascade logic require no changes.

## Demo accounts

All demo accounts use password `pravaah123`: `admin@`, `authority@`, `response@`, `analyst@`,
`citizen@` `pravaah.demo`. Roles shape the intended UI surface; server-side enforcement is not yet wired.

## Local development

```bash
bun install
bun run dev     # http://localhost:8080
```
