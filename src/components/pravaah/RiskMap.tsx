import { CircleMarker, MapContainer, Popup, TileLayer, LayersControl, Marker } from "react-leaflet";
import L from "leaflet";
import { INFRASTRUCTURE } from "@/lib/pravaah/demo-data";
import type { RiskAssessment } from "@/lib/pravaah/types";
import { DISTRICTS } from "@/lib/pravaah/demo-data";
import { riskHex } from "./primitives";

const infraIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:10px;height:10px;border:2px solid #7fdbe8;background:#12303a;transform:rotate(45deg)"></span>`,
  iconSize: [10, 10],
});

export default function RiskMap({
  assessments,
  onSelect,
  selectedId,
  height = 520,
  showInfrastructure = true,
}: {
  assessments: RiskAssessment[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  height?: number;
  showInfrastructure?: boolean;
}) {
  return (
    <MapContainer
      center={[27.5, 84]}
      zoom={5}
      style={{ height, width: "100%", borderRadius: 8 }}
      scrollWheelZoom
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Terrain">
          <TileLayer
            attribution="&copy; OpenTopoMap contributors"
            url="https://tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Street">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {assessments.map((a) => {
        const d = DISTRICTS.find((x) => x.id === a.location_id)!;
        const color = riskHex[a.risk_level];
        return (
          <CircleMarker
            key={a.location_id}
            center={[d.lat, d.lng]}
            radius={a.location_id === selectedId ? 18 : 8 + a.risk_score / 8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}
            eventHandlers={{ click: () => onSelect?.(a.location_id) }}
          >
            <Popup>
              <div style={{ minWidth: 230 }}>
                <div style={{ fontWeight: 600 }}>
                  {a.location_name}, {a.state}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>
                  DEMO / SIMULATION DATA
                </div>
                <hr style={{ opacity: 0.2, margin: "6px 0" }} />
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <div>
                    Risk Score: <b>{a.risk_score}/100</b> ({a.risk_level})
                  </div>
                  <div>Flood probability: {Math.round((a.hazard_probabilities['flood'] ?? 0) * 100)}%</div>
                  <div>
                    Landslide probability: {Math.round((a.hazard_probabilities['landslide'] ?? 0) * 100)}%
                  </div>
                  <div>Cascade risk: {Math.round(a.cascade_probability * 100)}%</div>
                  <div>Population exposed: {a.population_exposed.toLocaleString("en-IN")}</div>
                  <div>Critical infrastructure: {a.infrastructure_exposed}</div>
                  <div>
                    Recommended action: <b>{a.recommended_action}</b>
                  </div>
                  <div>Model confidence: {Math.round(a.confidence * 100)}%</div>
                  <div style={{ opacity: 0.7 }}>
                    Updated: {new Date(a.generated_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {showInfrastructure &&
        INFRASTRUCTURE.map((i) => (
          <Marker key={i.id} position={[i.lat, i.lng]} icon={infraIcon}>
            <Popup>
              <div style={{ fontSize: 12 }}>
                <b>{i.name}</b>
                <div>Type: {i.type}</div>
                <div>Status: {i.status}</div>
                <div>Population served: {i.population_served.toLocaleString("en-IN")}</div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
