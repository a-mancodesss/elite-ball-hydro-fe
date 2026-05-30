import type { OverallStatus } from "../types";

export function statusColor(status: string | null | undefined): {
  bg: string;
  text: string;
  marker: string;
  label: string;
} {
  switch (status) {
    case "COMPLIANT":
    case "LOW":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        marker: "#16a34a",
        label: "Compliant",
      };
    case "PARTIAL":
    case "MEDIUM":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        marker: "#eab308",
        label: "Partial",
      };
    case "HIGH":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        marker: "#f97316",
        label: "High Risk",
      };
    case "VIOLATION":
    case "CRITICAL":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        marker: "#dc2626",
        label: "Violation",
      };
    case "NOT_SUBMITTED":
    case null:
    case undefined:
      return {
        bg: "bg-slate-200",
        text: "text-slate-700",
        marker: "#64748b",
        label: "Not Submitted",
      };
    default:
      return {
        bg: "bg-slate-200",
        text: "text-slate-700",
        marker: "#64748b",
        label: status || "Unknown",
      };
  }
}

export function overallStatusLabel(s: OverallStatus): string {
  return {
    COMPLIANT: "Compliant",
    PARTIAL: "Partial",
    VIOLATION: "Violation",
    NOT_SUBMITTED: "Not Submitted",
  }[s];
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatNumber(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(digits);
}
