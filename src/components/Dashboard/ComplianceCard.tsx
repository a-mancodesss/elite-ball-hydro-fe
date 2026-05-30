import { Link } from "react-router-dom";
import type { ProjectPS4Summary } from "../../types";
import { formatDate, formatNumber, statusColor } from "../../utils/format";

interface Props {
  summary: ProjectPS4Summary;
  compact?: boolean;
}

export default function ComplianceCard({ summary, compact }: Props) {
  const overall = statusColor(summary.overall_status);
  const eflow = statusColor(summary.eflow.status || "NOT_SUBMITTED");
  const glof = statusColor(summary.glof.risk_label);
  const planScore = summary.emergency_plan.overall_score;
  const planStatus =
    !summary.emergency_plan.submitted
      ? "NOT_SUBMITTED"
      : planScore === null
        ? "NOT_SUBMITTED"
        : planScore >= 75
          ? "COMPLIANT"
          : planScore >= 50
            ? "PARTIAL"
            : "VIOLATION";
  const plan = statusColor(planStatus);

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={`/projects/${summary.project.id}`}
            className="font-semibold text-lg text-slate-900 hover:text-brand-600"
          >
            {summary.project.name}
          </Link>
          <div className="text-sm text-slate-500">
            {summary.project.river} · {summary.project.district} ·{" "}
            {summary.project.capacity_mw} MW
          </div>
        </div>
        <span className={`${overall.bg} ${overall.text} badge`}>
          {overall.label}
        </span>
      </div>

      {!compact && (
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <MetricBlock
            title="E-Flow"
            badge={eflow.label}
            badgeClass={`${eflow.bg} ${eflow.text}`}
            primary={
              summary.eflow.status
                ? `${summary.eflow.violation_days ?? 0} violation days`
                : "No report"
            }
            secondary={
              summary.eflow.avg_eflow_percent !== null
                ? `Avg release ${formatNumber(
                    summary.eflow.avg_eflow_percent
                  )}%`
                : formatDate(summary.eflow.last_submitted_at)
            }
          />
          <MetricBlock
            title="GLOF Risk"
            badge={glof.label}
            badgeClass={`${glof.bg} ${glof.text}`}
            primary={summary.glof.closest_lake_name || "No nearby lakes"}
            secondary={
              summary.glof.closest_lake_distance_km !== null
                ? `${formatNumber(
                    summary.glof.closest_lake_distance_km
                  )} km · ${formatNumber(
                    summary.glof.closest_lake_volume_million_m3
                  )} M m³`
                : "—"
            }
          />
          <MetricBlock
            title="Emergency Plan"
            badge={plan.label}
            badgeClass={`${plan.bg} ${plan.text}`}
            primary={
              planScore !== null && summary.emergency_plan.submitted
                ? `${formatNumber(planScore, 0)}/100`
                : "Not submitted"
            }
            secondary={
              summary.emergency_plan.critical_missing_count !== null
                ? `${summary.emergency_plan.critical_missing_count} critical gap(s)`
                : "Upload plan to score"
            }
          />
        </div>
      )}
    </div>
  );
}

function MetricBlock({
  title,
  badge,
  badgeClass,
  primary,
  secondary,
}: {
  title: string;
  badge: string;
  badgeClass: string;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </div>
        <span className={`${badgeClass} badge`}>{badge}</span>
      </div>
      <div className="font-medium text-slate-900 text-sm">{primary}</div>
      <div className="text-xs text-slate-500">{secondary}</div>
    </div>
  );
}
