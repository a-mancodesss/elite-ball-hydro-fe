import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { eflowApi, emergencyPlanApi, glofApi, projectsApi } from "../api";
import ComplianceCard from "../components/Dashboard/ComplianceCard";
import EFlowChart from "../components/EFlow/EFlowChart";
import ReportUpload from "../components/EFlow/ReportUpload";
import GapReport from "../components/EmergencyPlan/GapReport";
import PlanUpload from "../components/EmergencyPlan/PlanUpload";
import GlofRiskPanel from "../components/GLOF/GlofRiskPanel";
import { useAuth } from "../context/AuthContext";
import type {
  EFlowReport,
  EmergencyPlan,
  ProjectGlofRisk,
  ProjectPS4Summary,
} from "../types";
import { formatDate } from "../utils/format";

export default function ProjectDetailView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "HYDRO_ADMIN" && user.project_id === projectId;

  const [summary, setSummary] = useState<ProjectPS4Summary | null>(null);
  const [latestReport, setLatestReport] = useState<EFlowReport | null>(null);
  const [risk, setRisk] = useState<ProjectGlofRisk | null>(null);
  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([
        projectsApi.summary(projectId),
        glofApi.projectRisk(projectId),
      ]);
      setSummary(s);
      setRisk(r);

      try {
        setLatestReport(await eflowApi.latest(projectId));
      } catch {
        setLatestReport(null);
      }
      try {
        setPlan(await emergencyPlanApi.latest(projectId));
      } catch {
        setPlan(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading project...
      </div>
    );
  }
  if (error || !summary) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-red-600">
        {error || "Project not found"}
      </div>
    );
  }

  const project = summary.project;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={user?.role === "REGULATOR" ? "/regulator" : "/hydro"}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <div className="text-sm text-slate-500">
          {project.river} · {project.district} · {project.capacity_mw} MW ·{" "}
          {project.developer}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Status: {project.status} · Coordinates {project.lat.toFixed(3)},{" "}
          {project.lng.toFixed(3)}
        </div>
      </div>

      <ComplianceCard summary={summary} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900">E-Flow Compliance</h2>

          {latestReport ? (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-600">
                  Period{" "}
                  <span className="font-medium text-slate-900">
                    {formatDate(latestReport.report_period_start)} —{" "}
                    {formatDate(latestReport.report_period_end)}
                  </span>
                </div>
                <span className="badge bg-slate-500/10 text-slate-700 border-slate-500/20">
                  Submitted {formatDate(latestReport.submitted_at)}
                </span>
              </div>

              {latestReport.compliance_summary && (
                <div className="grid grid-cols-4 gap-2 text-center text-sm mb-4">
                  <SummaryCell
                    label="Days"
                    value={latestReport.compliance_summary.total_days}
                  />
                  <SummaryCell
                    label="Compliant"
                    value={latestReport.compliance_summary.compliant_days}
                    color="text-green-600"
                  />
                  <SummaryCell
                    label="Violations"
                    value={latestReport.compliance_summary.violation_days}
                    color="text-red-600"
                  />
                  <SummaryCell
                    label="Avg %"
                    value={latestReport.compliance_summary.avg_eflow_percent}
                    suffix="%"
                  />
                </div>
              )}

              {latestReport.parsed_readings && (
                <EFlowChart readings={latestReport.parsed_readings} />
              )}
            </div>
          ) : (
            <div className="card p-5 text-sm text-slate-500">
              No e-flow report submitted for this project yet.
            </div>
          )}

          {isAdmin && (
            <ReportUpload projectId={project.id} onUploaded={refresh} />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900">GLOF Risk</h2>
          <GlofRiskPanel risk={risk} />

          <h2 className="font-semibold text-slate-900 pt-2">
            Emergency Plan
          </h2>
          <GapReport plan={plan} />
          {isAdmin && (
            <PlanUpload projectId={project.id} onUploaded={refresh} />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  color = "text-slate-900",
  suffix = "",
}: {
  label: string;
  value: number | string;
  color?: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm p-3 shadow-sm hover:bg-white/50 transition-colors">
      <div className={`text-xl font-bold ${color}`}>
        {value}
        {suffix}
      </div>
      <div className="text-xs text-slate-600 font-medium uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
