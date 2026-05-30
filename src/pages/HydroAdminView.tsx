import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { glofApi, projectsApi } from "../api";
import ComplianceCard from "../components/Dashboard/ComplianceCard";
import ProjectMap from "../components/Map/ProjectMap";
import { useAuth } from "../context/AuthContext";
import type { GlofLake, ProjectPS4Summary } from "../types";

export default function HydroAdminView() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProjectPS4Summary | null>(null);
  const [lakes, setLakes] = useState<GlofLake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.project_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      projectsApi.summary(user.project_id),
      glofApi.lakes(),
    ])
      .then(([s, l]) => {
        setSummary(s);
        setLakes(l);
      })
      .catch((e) =>
        setError(e?.response?.data?.detail || e?.message || "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [user?.project_id]);

  if (user?.role === "REGULATOR") return <Navigate to="/regulator" replace />;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading your project...
      </div>
    );
  }
  if (error || !summary) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-red-600">
        {error || "No project assigned to your account."}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Project</h1>
        <p className="text-sm text-slate-500">
          PS4 compliance snapshot. Submit reports and emergency plans here.
        </p>
      </div>

      <ComplianceCard summary={summary} />

      <ProjectMap summaries={[summary]} lakes={lakes} height="320px" />

      <div className="text-right">
        <Link
          to={`/projects/${summary.project.id}`}
          className="btn-primary"
        >
          Open project workspace →
        </Link>
      </div>
    </div>
  );
}
