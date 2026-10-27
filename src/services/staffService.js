import { apiRequest } from "./ApiRequestHandler";

export const staffService = {
  // { search, role, branch } — all optional; branch "none" = no branch (main admins)
  getStaff: async ({ search, role, branch } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (branch) params.set("branch", branch);
    const query = params.toString();
    return (await apiRequest(`/staff${query ? `?${query}` : ""}`)).data;
  },

  create: async (data) => (await apiRequest("/staff", { method: "POST", body: data })).data,

  update: async (id, data) => (await apiRequest(`/staff/${id}`, { method: "PATCH", body: data })).data,

  setActive: async (id, isActive) =>
    (await apiRequest(`/staff/${id}/status`, { method: "PATCH", body: { isActive } })).data,

  resetPassword: (id, password) => apiRequest(`/staff/${id}/password`, { method: "PATCH", body: { password } }),
};
