import axios from "axios";

// List every backend deployment here (same code, same Google Sheet).
// Comma-separate real URLs in VITE_API_URLS on each platform (Render/Vercel env vars),
// falling back to this array for local dev.
const BACKENDS = (
  import.meta.env.VITE_API_URLS
    ? import.meta.env.VITE_API_URLS.split(",")
    : [
        "https://hackthon-hub-backend.onrender.com/api",
        "https://hackthon-hub-backend-2.onrender.com/api",
        "https://hackthon-hub-backend-3.onrender.com/api",
        "https://hackthon-hub-backend-4.onrender.com/api",
        "https://hackthon-hub-backend-5.onrender.com/api",
      ]
).map((u) => u.trim());

// Start on a random backend so traffic naturally spreads across all of them
// instead of everyone hammering backend #1 first.
let currentIndex = Math.floor(Math.random() * BACKENDS.length);

export const api = axios.create({
  baseURL: BACKENDS[currentIndex],
  timeout: 10000, // treat a hung/cold-starting backend as "busy" after 10s
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_access");
  if (adminToken && config.url?.startsWith("/admin/") && config.url !== "/admin/login/") {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  const teamToken = localStorage.getItem("team_token");
  if (teamToken && config.url?.startsWith("/team/") && config.url !== "/team/login/"){
    config.headers.Authorization = `Bearer ${teamToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;

    // "Busy" = network error, timeout, or the server itself failing (5xx).
    // A 400/401/404 etc. is a real answer from a healthy backend — don't retry those.
    const isBusy =
      !err.response || err.response.status >= 500 || err.code === "ECONNABORTED";

    config._retryCount = config._retryCount || 0;

    if (isBusy && config._retryCount < BACKENDS.length - 1) {
      config._retryCount += 1;
      currentIndex = (currentIndex + 1) % BACKENDS.length;
      const nextBackend = BACKENDS[currentIndex];
      api.defaults.baseURL = nextBackend; // stick with the working one for future requests
      config.baseURL = nextBackend;
      return api(config);
    }

    if (err.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("admin_access");
      localStorage.removeItem("admin_username");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    if (err.response?.status === 401 && window.location.pathname.startsWith("/team")) {
      localStorage.removeItem("team_token");
      localStorage.removeItem("team_id");
      localStorage.removeItem("team_name");
      if (window.location.pathname !== "/team/login") {
        window.location.href = "/team/login";
      }
    }
    return Promise.reject(err);
  }
);

export function isAdminLoggedIn() {
  return !!localStorage.getItem("admin_access");
}

export function isTeamLoggedIn() {
  return !!localStorage.getItem("team_token");
}