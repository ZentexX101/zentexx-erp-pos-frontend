import { apiRequest } from "./ApiRequestHandler";

export const staffService = {
  // { search, role, branch, status } — all optional; branch "none" = no branch (main admins)
  getStaff: async (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const query = params.toString();
    return (await apiRequest(`/staff${query ? `?${query}` : ""}`)).data;
  },

  // { modules: [{ key, label, group, actions }], actionLabels: { view: "View", ... } }
  getPermissionCatalog: async () => (await apiRequest("/staff/permissions")).data,

  create: async (data) => (await apiRequest("/staff", { method: "POST", body: data })).data,

  // Partial update; send password only to change it
  update: async (id, data) => (await apiRequest(`/staff/${id}`, { method: "PATCH", body: data })).data,

  remove: (id) => apiRequest(`/staff/${id}`, { method: "DELETE" }),
};
