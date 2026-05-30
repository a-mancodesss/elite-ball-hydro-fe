import { FormEvent, useRef, useState } from "react";
import { emergencyPlanApi } from "../../api";
import type { EmergencyPlan } from "../../types";

interface Props {
  projectId: string;
  onUploaded?: (plan: EmergencyPlan) => void;
}

export default function PlanUpload({ projectId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const plan = await emergencyPlanApi.upload(projectId, file);
      setSuccess(
        `AI scored your plan at ${plan.overall_score?.toFixed(0) ?? "?"}/100 ` +
          `with ${plan.critical_missing?.length ?? 0} critical gap(s).`
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(plan);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">
          Upload emergency plan
        </h3>
        <p className="text-sm text-slate-500">
          AI checks your plan against the IFC PS4 mandatory checklist (10 items)
          and returns a gap report.
        </p>
      </div>

      <div>
        <label className="label">PDF file</label>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-700
            file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0
            file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700
            hover:file:bg-brand-100"
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {success}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={busy || !file}>
        {busy ? "Analyzing..." : "Upload and analyze"}
      </button>
    </form>
  );
}
