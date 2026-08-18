import { api, BARBERSHOP_ID } from "./client.js";
const q = (v) => encodeURIComponent(v);
export const authApi = {
  login: (body) => api("/auth/login", { method: "POST", body }),
  register: (body) => api("/auth/register", { method: "POST", body }),
  me: (token) => api("/auth/me", { token }),
};
export const catalogApi = {
  services: () => api(`/services?barbershopId=${q(BARBERSHOP_ID)}`),
  professionals: () => api(`/professionals?barbershopId=${q(BARBERSHOP_ID)}`),
};
export const bookingApi = {
  availability: ({ staffId, serviceIds, date }) =>
    api(
      `/availability?barbershopId=${q(BARBERSHOP_ID)}&staffId=${q(staffId)}&serviceIds=${q(serviceIds.join(","))}&date=${q(date)}`,
    ),
  create: (body, token) =>
    api("/appointments", {
      method: "POST",
      token,
      body: { ...body, barbershopId: BARBERSHOP_ID },
    }),
  upcoming: (token) => api("/customers/me/appointments/upcoming", { token }),
  history: (token) => api("/customers/me/appointments", { token }),
  cancel: (id, reason, token) =>
    api(`/appointments/${id}`, { method: "DELETE", token, body: { reason } }),
  reschedule: (id, startsAt, token) =>
    api(`/appointments/${id}/reschedule`, {
      method: "PATCH",
      token,
      body: { startsAt },
    }),
};
