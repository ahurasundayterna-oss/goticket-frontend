import axios from "axios";
import { logout } from "../auth";

const API = axios.create({
  baseURL: "https://goticket-api.onrender.com/api",
});

/* ─────────────────────────────
   REQUEST INTERCEPTOR
───────────────────────────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("TOKEN:", token);
  }

  return config;
});


/* ─────────────────────────────
   RESPONSE INTERCEPTOR
───────────────────────────── */
API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const data   = error.response?.data;

    console.error("API ERROR:", status, data);

    // 🚫 Suspended user
    if (status === 403 && data?.suspended === true) {
      localStorage.setItem("suspensionReason", data.message || "Account suspended.");
      localStorage.setItem("suspensionLevel",  data.level   || "USER");

      window.location.href = "/suspended";
      return Promise.reject(error);
    }

    // 🔒 Invalid / expired token
    if (status === 401) {
      console.warn("401 → logging out");

      logout(); // 🔥 clears + triggers App update
      window.location.href = "/login";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;