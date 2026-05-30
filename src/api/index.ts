import { api } from "./client";
import type {
  AuthResponse,
  EFlowReport,
  EmergencyPlan,
  GlofLake,
  Project,
  ProjectGlofRisk,
  ProjectPS4Summary,
  User,
} from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    api
      .post<AuthResponse>("/auth/login", { email, password })
      .then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
};

export const projectsApi = {
  list: () => api.get<Project[]>("/projects").then((r) => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  summary: (id: string) =>
    api.get<ProjectPS4Summary>(`/projects/${id}/ps4-summary`).then((r) => r.data),
  summaryAll: () =>
    api
      .get<ProjectPS4Summary[]>("/projects/ps4-summary-all")
      .then((r) => r.data),
};

export const eflowApi = {
  upload: (projectId: string, file: File) => {
    const form = new FormData();
    form.append("project_id", projectId);
    form.append("file", file);
    return api
      .post<EFlowReport>("/eflow/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  list: (projectId: string) =>
    api.get<EFlowReport[]>(`/eflow/reports/${projectId}`).then((r) => r.data),
  latest: (projectId: string) =>
    api
      .get<EFlowReport>(`/eflow/reports/${projectId}/latest`)
      .then((r) => r.data),
  downloadTemplate: () =>
    api
      .get<Blob>("/templates/eflow", { responseType: "blob" })
      .then((r) => r.data),
};

export const glofApi = {
  lakes: () => api.get<GlofLake[]>("/glof/lakes").then((r) => r.data),
  projectRisk: (projectId: string) =>
    api.get<ProjectGlofRisk>(`/glof/risk/${projectId}`).then((r) => r.data),
  allRisks: () =>
    api.get<ProjectGlofRisk[]>("/glof/risk/all").then((r) => r.data),
};

export const emergencyPlanApi = {
  upload: (projectId: string, file: File) => {
    const form = new FormData();
    form.append("project_id", projectId);
    form.append("file", file);
    return api
      .post<EmergencyPlan>("/emergency-plan/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  latest: (projectId: string) =>
    api.get<EmergencyPlan>(`/emergency-plan/${projectId}`).then((r) => r.data),
};
