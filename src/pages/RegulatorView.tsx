import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { glofApi, projectsApi } from "../api";
import ProjectMap from "../components/Map/ProjectMap";
import type { GlofLake, ProjectPS4Summary } from "../types";
import { formatNumber, statusColor } from "../utils/format";

type StatusFilter = "ALL" | "COMPLIANT" | "PARTIAL" | "VIOLATION" | "NOT_SUBMITTED";

export default function RegulatorView() {
  const [summaries, setSummaries] = useState<ProjectPS4Summary[]>([]);
  const [lakes, setLakes] = useState<GlofLake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"name" | "status" | "capacity">("status");

  useEffect(() => {
    setLoading(true);
    Promise.all([projectsApi.summaryAll(), glofApi.lakes()])
      .then(([s, l]) => {
        setSummaries(s);
        setLakes(l);
      })
      .catch((e) => setError(e?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const districts = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach((s) => {
      if (s.project.district) set.add(s.project.district);
    });
    return Array.from(set).sort();
  }, [summaries]);

  const filtered = useMemo(() => {
    let rows = [...summaries];
    if (statusFilter !== "ALL") {
      rows = rows.filter((r) => r.overall_status === statusFilter);
    }
    if (districtFilter !== "ALL") {
      rows = rows.filter((r) => r.project.district === districtFilter);
    }
    rows.sort((a, b) => {
      if (sortBy === "name") return a.project.name.localeCompare(b.project.name);
      if (sortBy === "capacity")
        return (b.project.capacity_mw || 0) - (a.project.capacity_mw || 0);
      const order = ["VIOLATION", "NOT_SUBMITTED", "PARTIAL", "COMPLIANT"];
      return (
        order.indexOf(a.overall_status) - order.indexOf(b.overall_status)
      );
    });
    return rows;
  }, [summaries, statusFilter, districtFilter, sortBy]);

  const stats = useMemo(() => {
    const counts = { COMPLIANT: 0, PARTIAL: 0, VIOLATION: 0, NOT_SUBMITTED: 0 };
    summaries.forEach((s) => counts[s.overall_status]++);
    return counts;
  }, [summaries]);

  function exportCsv() {
    const headers = [
      "Project",
      "River",
      "District",
      "Capacity (MW)",
      "Overall",
      "E-Flow",
      "Violation Days",
      "GLOF Risk",
      "Closest Lake",
      "Lake Distance (km)",
      "Plan Score",
      "Critical Gaps",
    ];
    const rows = filtered.map((s) => [
      s.project.name,
      s.project.river,
      s.project.district ?? "",
      s.project.capacity_mw ?? "",
      s.overall_status,
      s.eflow.status ?? "—",
      s.eflow.violation_days ?? 0,
      s.glof.risk_label,
      s.glof.closest_lake_name ?? "—",
      s.glof.closest_lake_distance_km ?? "",
      s.emergency_plan.overall_score ?? "—",
      s.emergency_plan.critical_missing_count ?? "—",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((c) =>
            typeof c === "string" && (c.includes(",") || c.includes('"'))
              ? `"${c.replace(/"/g, '""')}"`
              : c
          )
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ps4-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading PS4 compliance overview...
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Regulator Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Nepal hydropower PS4 compliance · all monitored projects
          </p>
        </div>
        <button onClick={exportCsv} className="btn-secondary">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Compliant"
          value={stats.COMPLIANT}
          color="bg-green-50 text-green-700 border-green-200"
        />
        <StatCard
          label="Partial"
          value={stats.PARTIAL}
          color="bg-yellow-50 text-yellow-700 border-yellow-200"
        />
        <StatCard
          label="Violation"
          value={stats.VIOLATION}
          color="bg-red-50 text-red-700 border-red-200"
        />
        <StatCard
          label="Not Submitted"
          value={stats.NOT_SUBMITTED}
          color="bg-slate-100 text-slate-700 border-slate-200"
        />
      </div>

      <ProjectMap summaries={summaries} lakes={lakes} />

      <div className="card">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">All Projects</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} of {summaries.length} shown
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input py-1.5 text-sm w-auto"
            >
              <option value="ALL">All statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="PARTIAL">Partial</option>
              <option value="VIOLATION">Violation</option>
              <option value="NOT_SUBMITTED">Not submitted</option>
            </select>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="input py-1.5 text-sm w-auto"
            >
              <option value="ALL">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "status" | "capacity")}
              className="input py-1.5 text-sm w-auto"
            >
              <option value="status">Sort by status</option>
              <option value="name">Sort by name</option>
              <option value="capacity">Sort by capacity</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <Th>Project</Th>
                <Th>River / District</Th>
                <Th>MW</Th>
                <Th>Overall</Th>
                <Th>E-Flow</Th>
                <Th>GLOF</Th>
                <Th>Plan</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const overall = statusColor(s.overall_status);
                const ef = statusColor(s.eflow.status || "NOT_SUBMITTED");
                const gf = statusColor(s.glof.risk_label);
                return (
                  <tr
                    key={s.project.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {s.project.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.project.river}
                      <div className="text-xs text-slate-400">
                        {s.project.district}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.project.capacity_mw}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${overall.bg} ${overall.text} badge`}>
                        {overall.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${ef.bg} ${ef.text} badge`}>
                        {ef.label}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.eflow.violation_days
                          ? `${s.eflow.violation_days} viol. days`
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${gf.bg} ${gf.text} badge`}>
                        {gf.label}
                      </span>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.glof.closest_lake_name ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {s.emergency_plan.submitted
                        ? `${formatNumber(s.emergency_plan.overall_score, 0)}/100`
                        : <span className="text-slate-400">Not submitted</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/projects/${s.project.id}`}
                        className="text-brand-600 font-medium hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2 text-left font-semibold">{children}</th>;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`border rounded-lg p-4 ${color}`}>
      <div className="text-xs uppercase tracking-wide font-semibold">
        {label}
      </div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
