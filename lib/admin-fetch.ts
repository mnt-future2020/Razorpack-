export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then((response) => {
    // A 401 means the stored token is stale (expired, or signed with an older
    // JWT_SECRET). Drop it and bounce to login rather than leaving the page to
    // render a permanently failing view. Mirrors the axios interceptor in
    // lib/admin-axios.ts, which covers the pages that use axios instead.
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return response;
  });
}
