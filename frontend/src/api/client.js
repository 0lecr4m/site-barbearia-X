const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");
export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message);
    Object.assign(this, { code, status, details });
  }
}
export async function api(path, { token, body, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      payload?.error?.message || "Não foi possível concluir a solicitação.",
      payload?.error?.code,
      response.status,
      payload?.error?.details,
    );
  return payload?.data;
}
export const BARBERSHOP_ID = import.meta.env.VITE_BARBERSHOP_ID || "";
