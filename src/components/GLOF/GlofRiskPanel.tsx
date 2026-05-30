import type { ProjectGlofRisk } from "../../types";
import { formatNumber, statusColor } from "../../utils/format";

interface Props {
  risk: ProjectGlofRisk | null;
}

export default function GlofRiskPanel({ risk }: Props) {
  if (!risk) {
    return (
      <div className="card p-5 text-sm text-slate-500">
        No GLOF risk data computed.
      </div>
    );
  }

  const sc = statusColor(risk.risk_label);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">GLOF Risk Assessment</h3>
          <p className="text-sm text-slate-500">
            Based on ICIMOD priority lakes in the {risk.project_name} river
            system
          </p>
        </div>
        <div className={`${sc.bg} ${sc.text} rounded-md px-4 py-2 text-center`}>
          <div className="text-xl font-bold">
            {risk.risk_score !== null ? formatNumber(risk.risk_score, 0) : "—"}
          </div>
          <div className="text-xs uppercase tracking-wide">{sc.label}</div>
        </div>
      </div>

      {risk.closest_lake ? (
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Stat
            label="Closest dangerous lake"
            value={risk.closest_lake.name}
            sub={risk.closest_lake.icimod_risk_class}
          />
          <Stat
            label="River distance (approx)"
            value={`${formatNumber(risk.distance_km)} km`}
            sub="HydroSHEDS-derived"
          />
          <Stat
            label="Lake volume"
            value={`${formatNumber(risk.closest_lake.volume_million_m3)} M m³`}
            sub={`${formatNumber(risk.closest_lake.area_sqkm, 2)} km² surface area`}
          />
          <Stat
            label="Downstream population at risk"
            value={
              risk.downstream_population
                ? risk.downstream_population.toLocaleString()
                : "—"
            }
            sub="WorldPop estimate"
          />
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-500">
          No high-risk glacial lakes found in this river system.
        </div>
      )}

      {risk.all_lakes_in_system.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            All lakes in {risk.all_lakes_in_system[0]?.river_system} system
          </div>
          <ul className="space-y-1">
            {risk.all_lakes_in_system.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between text-sm border border-slate-200 rounded px-3 py-1.5"
              >
                <span className="font-medium">{l.name}</span>
                <span className="text-slate-500">
                  {l.volume_million_m3} M m³ · {l.icimod_risk_class}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-base font-semibold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
