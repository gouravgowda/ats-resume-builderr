/**
 * API client for all backend requests.
 * Authentication: Firebase ID token (fetched fresh per request) sent as a
 * Bearer token. The FastAPI backend verifies it with firebase-admin.
 */
import axios from "axios";
import { getIdToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach the current user's Firebase ID token
api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 (expired/invalid token)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
// Register/login now happen directly with Firebase (see lib/firebase.ts).
// The backend exposes /auth/me to create/fetch the user profile in Firestore.
export const authApi = {
  me: () => api.get("/auth/me"),
};

// ── Resumes ──────────────────────────────────────────────────────────────────
export const resumeApi = {
  list: () => api.get("/resumes"),
  get: (id: string) => api.get(`/resumes/${id}`),
  create: (data: unknown) => api.post("/resumes", data),
  updateSections: (id: string, data: unknown) =>
    api.put(`/resumes/${id}/sections`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  duplicate: (id: string) => api.post(`/resumes/${id}/duplicate`),
  rename: (id: string, title: string) => api.patch(`/resumes/${id}/title`, { title }),
  importPdf: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/resumes/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ── Bullets ──────────────────────────────────────────────────────────────────
export const bulletApi = {
  improve: (resumeId: string, raw_text: string, context?: string) =>
    api.post(`/resumes/${resumeId}/bullets/improve`, { raw_text, context }),
};

// ── Render ────────────────────────────────────────────────────────────────────
export const renderApi = {
  previewHtml: (resumeId: string, template = "clean") =>
    `${API_BASE}/resumes/${resumeId}/preview-html?template=${template}`,
  download: (resumeId: string, format: "pdf" | "docx", template = "clean") =>
    api.post(
      `/resumes/${resumeId}/render`,
      { format, template },
      { responseType: "blob" }
    ),
};

// ── Parse check ───────────────────────────────────────────────────────────────
export const parseCheckApi = {
  run: (resumeId: string) =>
    api.post(`/resumes/${resumeId}/parse-check`),
};

// ── Score ─────────────────────────────────────────────────────────────────────
export const scoreApi = {
  run: (resumeId: string, jd_text?: string) =>
    api.post(`/resumes/${resumeId}/score`, { jd_text }),
  history: (resumeId: string) =>
    api.get(`/resumes/${resumeId}/scores`),
};

// ── Tailor ────────────────────────────────────────────────────────────────────
export const tailorApi = {
  run: (resumeId: string, jd_text: string, resume_title?: string) =>
    api.post(`/resumes/${resumeId}/tailor`, { jd_text, resume_title }),
};

// ── Cover Letter ──────────────────────────────────────────────────────────────
export const coverLetterApi = {
  generate: (resumeId: string, jd_text: string, company_name?: string) =>
    api.post(`/resumes/${resumeId}/cover-letter`, { jd_text, company_name }),
  list: (resumeId: string) =>
    api.get(`/resumes/${resumeId}/cover-letters`),
};

// ── Helper: download blob ─────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
