// Appels au serveur : le cookie "token" est envoyé automatiquement (même origine grâce au proxy Vite)
export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// en local : "/api" (proxy Vite). En ligne : "/api" aussi grâce au proxy Netlify (public/_redirects),
// ou l'adresse complète du serveur dans VITE_API_URL (ex. https://aidy-api.onrender.com/api)
export const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "network");
  }
  // 502/503/504 : le proxy ne trouve pas le serveur (arrêté ou en train de redémarrer)
  if ([502, 503, 504].includes(response.status)) throw new ApiError(response.status, "network");
  // 429 : trop d'essais (protection contre les robots qui testent des mots de passe)
  if (response.status === 429) throw new ApiError(429, "tooMany");
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // erreurs de validation Zod : on garde le détail par champ
    const message = data?.errors?.map((e) => `${e.field}: ${e.message}`).join(" · ") || data?.message || `Error ${response.status}`;
    throw new ApiError(response.status, message, data);
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body = {}) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),
};
