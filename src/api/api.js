import axios from "axios";

const API = axios.create({
  baseURL: "https://goticket-api.onrender.com/api",
});

// attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN BEFORE REQUEST:", token); // debug

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// handle responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔥 API ERROR:", error.response);

    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 403 && data?.suspended === true) {
      localStorage.setItem(
        "suspensionReason",
        data.message || "Account suspended."
      );
      localStorage.setItem(
        "suspensionLevel",
        data.level || "USER"
      );

      window.location.href = "/suspended";
      return new Promise(() => {});
    }

    // IMPORTANT: temporarily disable forced logout
    if (status === 401) {
      console.error("401 ERROR - TOKEN MAY BE MISSING");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;