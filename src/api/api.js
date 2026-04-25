import axios from "axios";

const API = axios.create({
  baseURL: "https://goticket-api.onrender.com/api",
});

// ── Request interceptor — attach token ────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN BEING SENT:", token); // 👈 DEBUG LINE

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor ──────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data   = error.response?.data;

    console.log("API ERROR:", status, data); // 👈 DEBUG

    if (status === 403 && data?.suspended === true) {
      localStorage.setItem("suspensionReason", data.message || "Account suspended.");
      localStorage.setItem("suspensionLevel", data.level || "USER");
      window.location.href = "/suspended";
      return new Promise(() => {});
    }

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default API;