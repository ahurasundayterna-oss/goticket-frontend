/**
 * frontend/src/api/api.js
 *
 * CHANGED from previous version:
 *   - Response interceptor added.
 *   - When the API returns 403 with { suspended: true }, the interceptor
 *     stores the suspension reason in localStorage and redirects to /suspended.
 *   - All other 401/403 behaviour is unchanged.
 *
 * The `suspended: true` flag (set by the updated auth middleware) is what
 * distinguishes a suspension 403 from a permissions 403 — we never match
 * on the message string so it's safe to change messages later.
 */

import axios from "axios";

const API = axios.create({
baseURL: "http://localhost:5000/api"
});

// ── Request interceptor — attach token (unchanged) ────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle suspension 403 ─────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data   = error.response?.data;

    if (status === 403 && data?.suspended === true) {
      // Store the reason so SuspendedScreen can display it
      localStorage.setItem("suspensionReason", data.message  || "Account suspended.");
      localStorage.setItem("suspensionLevel",  data.level    || "USER");

      // Redirect — works whether the app uses hash or browser routing
      window.location.href = "/suspended";

      // Return a never-resolving promise so the calling component
      // doesn't try to handle the error after the redirect fires
      return new Promise(() => {});
    }

    // 401 — token expired or missing → back to login
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default API;