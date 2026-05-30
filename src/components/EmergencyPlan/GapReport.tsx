import type { EmergencyPlan } from "../../types";
import { formatDate } from "../../utils/format";

interface Props {
  plan: EmergencyPlan | null;
}

export default function GapReport({ plan }: Props) {
  if (!plan || !plan.ai_gap_report) {
    return (
      <div className="card p-5 text-sm text-slate-500">
        No emergency plan submitted yet. Upload one to see the AI gap report.
      </div>
    );
  }

  const r = plan.ai_gap_report;
  const score = r.overall_score ?? 0;
  const scoreColor =
    score >= 75
      ? "bg-green-100 text-green-800"
      : score >= 50
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Emergency Plan Gap Report
          </h3>
          <p className="text-sm text-slate-500">
            AI-generated against IFC PS4 mandatory checklist · Submitted{" "}
            {formatDate(plan.submitted_at)}
          </p>
        </div>
        <div
          className={`rounded-md ${scoreColor} px-4 py-3 text-center font-semibold`}
        >
          <div className="text-2xl">{score.toFixed(0)}</div>
          <div className="text-xs uppercase tracking-wide">/ 100</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 p-5">
        <ChecklistRow label="GLOF section" present={r.glof_section_present} />
        <ChecklistRow
          label="Early warning system"
          present={r.warning_system_described}
        />
        <ChecklistRow
          label="Evacuation routes"
          present={r.downstream_villages_listed}
          extra={
            r.evacuation_routes_count !== null
              ? `${r.evacuation_routes_count} routes`
              : null
          }
        />
        <ChecklistRow
          label="Security protocol"
          present={r.security_protocol_present}
        />
        <ChecklistRow
          label="Annual review schedule"
          present={r.review_date_present}
        />
      </div>

      <div className="px-5 pb-5">
        <p className="text-sm text-slate-700 italic">{r.summary}</p>
      </div>

      {r.critical_missing.length > 0 && (
        <div className="px-5 pb-5">
          <div className="text-sm font-semibold text-red-700 mb-2">
            Critical missing items ({r.critical_missing.length})
          </div>
          <ul className="space-y-1">
            {r.critical_missing.map((item, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 bg-red-50 border border-red-200 rounded px-3 py-1.5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.partial_items.length > 0 && (
        <div className="px-5 pb-5">
          <div className="text-sm font-semibold text-yellow-700 mb-2">
            Partially addressed ({r.partial_items.length})
          </div>
          <ul className="space-y-1">
            {r.partial_items.map((item, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.present_items.length > 0 && (
        <div className="px-5 pb-5">
          <div className="text-sm font-semibold text-green-700 mb-2">
            Present ({r.present_items.length})
          </div>
          <ul className="space-y-1">
            {r.present_items.map((item, i) => (
              <li
                key={i}
                className="text-sm text-slate-800 bg-green-50 border border-green-200 rounded px-3 py-1.5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  label,
  present,
  extra,
}: {
  label: string;
  present: boolean;
  extra?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
      <span
        className={`w-7 h-7 rounded-full grid place-items-center text-white text-sm font-bold ${
          present ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {present ? "✓" : "✕"}
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {extra && <div className="text-xs text-slate-500">{extra}</div>}
      </div>
    </div>
  );
}
