const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (
  path,
  { method = "GET", body, headers = {}, raw = false, skipAuth = false } = {},
) => {
  const finalHeaders = { ...headers };

  if (!skipAuth) {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Do NOT set Content-Type for FormData
  if (body instanceof FormData) {
    delete finalHeaders["Content-Type"];
  } else if (body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // ✅ Global 401 handler → triggers auto-logout in AuthContext
  if (response.status === 401) {
    let bodyData = {};
    try {
      bodyData = await response.clone().json();
    } catch {
        // Ignore JSON parse errors for non-JSON responses
    }

    // Don't auto-logout if we're on the login endpoint itself
    // (invalid credentials should show "Invalid email or password", not "session expired")
    if (!path.includes("/auth/staff/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new CustomEvent("auth:expired", {
          detail: {
            code: bodyData.code || "TOKEN_INVALID",
            message: bodyData.message || "Session expired.",
          },
        }),
      );
    }

    const err = new Error(
      bodyData.message || "Authentication required.",
    );
    err.status = 401;
    err.code = bodyData.code;
    throw err;
  }

  // ✅ Non-401 errors still throw so callers can show messages
  if (!response.ok) {
    let bodyData = {};
    try {
      bodyData = await response.clone().json();
    } catch {
        // Ignore JSON parse errors for non-JSON responses
    }
    const err = new Error(
      bodyData.message || `Request failed (${response.status})`,
    );
    err.status = response.status;
    err.body = bodyData;
    throw err;
  }

  if (raw) return response;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  if (contentType.includes("text/")) return response.text();
  return response.blob();
};