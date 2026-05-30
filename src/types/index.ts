export type UserRole = "REGULATOR" | "HYDRO_ADMIN";

export type ProjectStatus = "UNDER_CONSTRUCTION" | "OPERATIONAL" | "SUSPENDED";

export type EFlowStatus = "COMPLIANT" | "VIOLATION" | "PARTIAL" | "DATA_MISSING";

export type IcimodRiskClass = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";

export type OverallStatus =
  | "COMPLIANT"
  | "PARTIAL"
  | "VIOLATION"
  | "NOT_SUBMITTED";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  project_id: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  river: string;
  capacity_mw: number | null;
  lat: number;
  lng: number;
  district: string | null;
  developer: string | null;
  status: ProjectStatus;
  design_diversion_cumecs: number | null;
  fdc_dry_season_q95: number | null;
  fdc_monsoon_q95: number | null;
  created_at: string;
}

export interface EFlowSummary {
  status: EFlowStatus | null;
  compliant_days: number | null;
  violation_days: number | null;
  total_days: number | null;
  avg_eflow_percent: number | null;
  last_report_id: string | null;
  last_submitted_at: string | null;
}

export interface GlofSummary {
  risk_label: string;
  risk_score: number | null;
  closest_lake_name: string | null;
  closest_lake_distance_km: number | null;
  closest_lake_volume_million_m3: number | null;
  closest_lake_class: string | null;
}

export interface EmergencyPlanSummary {
  overall_score: number | null;
  critical_missing_count: number | null;
  last_submitted_at: string | null;
  submitted: boolean;
}

export interface ProjectPS4Summary {
  project: Project;
  overall_status: OverallStatus;
  eflow: EFlowSummary;
  glof: GlofSummary;
  emergency_plan: EmergencyPlanSummary;
}

export interface EFlowReading {
  date: string;
  upstream_cumecs: number | null;
  downstream_cumecs: number | null;
  eflow_percent: number | null;
  compliant: boolean;
  measurement_method: string | null;
  notes: string | null;
}

export interface EFlowComplianceSummary {
  total_days: number;
  compliant_days: number;
  violation_days: number;
  avg_eflow_percent: number;
  min_eflow_percent: number;
  season: string;
  fdc_baseline_used: number | null;
  data_gaps: number;
}

export interface EFlowReport {
  id: string;
  project_id: string;
  report_period_start: string | null;
  report_period_end: string | null;
  parsed_readings: EFlowReading[] | null;
  compliance_summary: EFlowComplianceSummary | null;
  overall_status: EFlowStatus;
  violation_days: number;
  submitted_at: string;
}

export interface GlofLake {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area_sqkm: number | null;
  volume_million_m3: number | null;
  icimod_risk_class: IcimodRiskClass;
  river_system: string | null;
  last_assessed: string | null;
}

export interface ProjectGlofRisk {
  project_id: string;
  project_name: string;
  risk_label: string;
  risk_score: number | null;
  closest_lake: GlofLake | null;
  distance_km: number | null;
  downstream_population: number | null;
  all_lakes_in_system: GlofLake[];
}

export interface AiGapReport {
  overall_score: number;
  critical_missing: string[];
  partial_items: string[];
  present_items: string[];
  glof_section_present: boolean;
  evacuation_routes_count: number | null;
  warning_system_described: boolean;
  downstream_villages_listed: boolean;
  security_protocol_present: boolean;
  review_date_present: boolean;
  summary: string;
}

export interface EmergencyPlan {
  id: string;
  project_id: string;
  pdf_path: string | null;
  ai_gap_report: AiGapReport | null;
  overall_score: number | null;
  critical_missing: string[] | null;
  submitted_at: string;
}
