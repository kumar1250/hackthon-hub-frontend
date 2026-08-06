import axios from "axios";

export const api = axios.create({
  baseURL: "https://hackthon-hub-backend.onrender.com/api",
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
  (err) => {
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
