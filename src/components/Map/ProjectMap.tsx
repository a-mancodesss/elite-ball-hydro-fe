import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { GlofLake, ProjectPS4Summary } from "../../types";
import { statusColor } from "../../utils/format";
import { Link } from "react-router-dom";

interface Props {
  summaries: ProjectPS4Summary[];
  lakes: GlofLake[];
  height?: string;
}

function projectIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};border:3px solid white;border-radius:9999px;width:18px;height:18px;box-shadow:0 0 0 1px rgba(0,0,0,0.25);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const LAKE_COLOR: Record<string, string> = {
  VERY_HIGH: "#7c1d1d",
  HIGH: "#dc2626",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6",
};

export default function ProjectMap({ summaries, lakes, height = "560px" }: Props) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/60 shadow-sm relative"
      style={{ height }}
    >
      <MapContainer
        center={[28.3949, 84.124]}
        zoom={7}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {lakes.map((lake) => {
          const radius = Math.max(
            6,
            Math.min(20, Math.sqrt(lake.volume_million_m3 || 5) * 2)
          );
          const color = LAKE_COLOR[lake.icimod_risk_class] || "#3b82f6";
          return (
            <CircleMarker
              key={lake.id}
              center={[lake.lat, lake.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{lake.name}</div>
                  <div className="text-slate-600">
                    Glacial lake · {lake.river_system}
                  </div>
                  <div className="mt-1">
                    <span className="font-medium">ICIMOD class:</span>{" "}
                    {lake.icimod_risk_class}
                  </div>
                  <div>
                    <span className="font-medium">Volume:</span>{" "}
                    {lake.volume_million_m3} M m³
                  </div>
                  <div>
                    <span className="font-medium">Area:</span> {lake.area_sqkm} km²
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {summaries.map((s) => {
          const sc = statusColor(s.overall_status);
          return (
            <Marker
              key={s.project.id}
              position={[s.project.lat, s.project.lng]}
              icon={projectIcon(sc.marker)}
            >
              <Popup>
                <div className="text-sm min-w-[220px]">
                  <div className="font-semibold text-base">
                    {s.project.name}
                  </div>
                  <div className="text-slate-600 mb-2">
                    {s.project.river} · {s.project.capacity_mw} MW
                  </div>
                  <div className="space-y-1">
                    <Row label="E-Flow" value={s.eflow.status || "Not submitted"} />
                    <Row label="GLOF" value={s.glof.risk_label} />
                    <Row
                      label="Plan"
                      value={
                        s.emergency_plan.submitted
                          ? `${s.emergency_plan.overall_score?.toFixed(0) || "?"}/100`
                          : "Not submitted"
                      }
                    />
                  </div>
                  <Link
                    to={`/projects/${s.project.id}`}
                    className="block mt-3 text-brand-600 font-medium text-sm hover:underline"
                  >
                    Open project →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[400] bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/60 px-3 py-2 text-xs space-y-1">
        <div className="font-semibold text-slate-700">Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-600 border-2 border-white" />
          Compliant
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white" />
          Partial
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white" />
          Violation
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500 border-2 border-white" />
          Not submitted
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-1">
          <span className="w-3 h-3 rounded-full bg-red-700 opacity-50" />
          Glacial lake
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
