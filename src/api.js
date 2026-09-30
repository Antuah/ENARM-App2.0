let csrfToken = null;

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(csrfToken && method !== "GET" ? { "X-CSRF-Token": csrfToken } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(
      "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      0,
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "El servidor no está disponible. Inténtalo de nuevo.",
      response.status,
    );
  }
  if (!response.ok)
    throw new ApiError(
      data.error?.message || "No se pudo completar la solicitud.",
      response.status,
      data.error?.code,
    );
  return data;
}

export const api = {
  async restore() {
    const data = await request("/auth/me");
    csrfToken = data.csrfToken;
    return request("/bootstrap");
  },
  async authenticate(signup, body) {
    const data = await request(signup ? "/auth/register" : "/auth/login", {
      method: "POST",
      body,
    });
    csrfToken = data.csrfToken;
    return request("/bootstrap");
  },
  async logout() {
    await request("/auth/logout", { method: "POST" });
    csrfToken = null;
  },
  bootstrap: () => request("/bootstrap"),
  profile: (body) => request("/profile", { method: "PATCH", body }),
  forgot: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),
  reset: (body) => request("/auth/reset-password", { method: "POST", body }),
  start: (body) => request("/sessions", { method: "POST", body }),
  session: (id) => request(`/sessions/${id}`),
  patchSession: (id, body) =>
    request(`/sessions/${id}`, { method: "PATCH", body }),
  reveal: (id, questionId) =>
    request(`/sessions/${id}/questions/${questionId}/reveal`, {
      method: "POST",
    }),
  rate: (id, questionId, rating) =>
    request(`/sessions/${id}/review`, {
      method: "POST",
      body: { questionId, rating },
    }),
  finish: (id) => request(`/sessions/${id}/finish`, { method: "POST" }),
  abandon: (id) => request(`/sessions/${id}/abandon`, { method: "POST" }),
  mark: (id, marked) =>
    request(`/bookmarks/${id}`, { method: "PUT", body: { marked } }),
  stats: (period) => request(`/stats?period=${period}`),
};
