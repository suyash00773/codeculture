import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pravaah/head";
import { getWeatherProvider } from "@/lib/pravaah/providers";
import { DemoBanner, PageHeader, Panel } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/weather")({
  head: pageHead(
    "Weather",
    "Rainfall, temperature and humidity feeding the risk engine, served through a swappable WeatherProvider abstraction.",
  ),
  component: WeatherPage,
});

function WeatherPage() {
  const provider = getWeatherProvider();
  const rows = provider.getObservations();

  return (
    <>
      <PageHeader
        title="Weather"
        subtitle={`Provider: ${provider.name} — an interface-based abstraction so a real IMD or third-party adapter can be connected without touching the risk engine.`}
      />
      <DemoBanner text={`DATA SOURCE: ${provider.sourceLabel}. No live meteorological API is connected.`} />

      <Panel title="Current observations & 24h outlook">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["District", "State", "Condition", "Rain 24h", "Forecast 24h", "Temp", "Humidity", "Wind", "Source"].map((h) => (
                  <th key={h} className="label-mono py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.location_id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-medium">{r.location_name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.state}</td>
                  <td className="py-2 pr-4">{r.condition}</td>
                  <td className="py-2 pr-4 font-mono">{r.rainfall_mm_24h} mm</td>
                  <td className="py-2 pr-4 font-mono">{r.rainfall_forecast_mm_24h} mm</td>
                  <td className="py-2 pr-4 font-mono">{r.temperature_c}°C</td>
                  <td className="py-2 pr-4 font-mono">{r.humidity_pct}%</td>
                  <td className="py-2 pr-4 font-mono">{r.wind_kph} kph</td>
                  <td className="py-2 pr-4 font-mono text-risk-moderate">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
