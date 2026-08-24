import axios from "axios";

// Endpoints where a 401 is a normal, page-handled outcome — a wrong password on
// the login form, an expired reset link. These must NOT tear down the session,
// or the login page would redirect itself instead of showing its error toast.
const AUTH_ENDPOINTS = [
  "/api/admin/auth/login",
  "/api/admin/auth/forgot-password",
  "/api/admin/auth/reset-password",
];

const isAdminApi = (url: string) => url.startsWith("/api/admin");
const isAuthEndpoint = (url: string) =>
  AUTH_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));

let installed = false;

/**
 * Registers interceptors on the default axios instance, so every existing
 * `axios.get("/api/admin/...")` call site gets token injection and 401 handling
 * without being rewritten.
 *
 * `onUnauthorized` runs after the stale token has been cleared — AdminShell
 * uses it to bounce the user to /login.
 */
export function installAdminAxios(onUnauthorized: () => void) {
  if (installed) return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const url = config.url ?? "";
    if (isAdminApi(url) && !isAuthEndpoint(url)) {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url ?? "";
      if (
        error.response?.status === 401 &&
        isAdminApi(url) &&
        !isAuthEndpoint(url)
      ) {
        // The token is stale (expired, or signed with an older JWT_SECRET).
        // Drop it so the guard cannot keep treating it as a valid session.
        localStorage.removeItem("admin_token");
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
}
