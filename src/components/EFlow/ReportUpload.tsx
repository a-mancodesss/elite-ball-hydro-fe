import { FormEvent, useRef, useState } from "react";
import { eflowApi } from "../../api";
import type { EFlowReport } from "../../types";

interface Props {
  projectId: string;
  onUploaded?: (report: EFlowReport) => void;
}

export default function ReportUpload({ projectId, onUploaded }: Props) {
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
      const report = await eflowApi.upload(projectId, file);
      setSuccess(
        `Parsed ${report.compliance_summary?.total_days || 0} days. ` +
          `Status: ${report.overall_status} (${report.violation_days} violation days).`
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(report);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function downloadTemplate() {
    const blob = await eflowApi.downloadTemplate();
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eflow-template.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Upload monthly e-flow report
          </h3>
          <p className="text-sm text-slate-500">
            Use the standardized template. The system parses your PDF and flags
            violation days automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="btn-ghost text-sm whitespace-nowrap"
        >
          Download template
        </button>
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
        {busy ? "Parsing..." : "Upload and parse"}
      </button>
    </form>
  );
}
