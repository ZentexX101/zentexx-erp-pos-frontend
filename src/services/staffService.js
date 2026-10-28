import { toQueryString } from "../utils/queryString";
import { apiRequest } from "./ApiRequestHandler";

export const staffService = {
  // One page: { search, role, branch, status, page, limit } -> { data, meta }; branch "none" = main admins
  getStaff: (params) => apiRequest(`/staff${toQueryString(params)}`),

  // { modules: [{ key, label, group, actions }], actionLabels: { view: "View", ... } }
  getPermissionCatalog: async () => (await apiRequest("/staff/permissions")).data,

  create: async (data) => (await apiRequest("/staff", { method: "POST", body: data })).data,

  // Partial update; send password only to change it
  update: async (id, data) => (await apiRequest(`/staff/${id}`, { method: "PATCH", body: data })).data,

  remove: (id) => apiRequest(`/staff/${id}`, { method: "DELETE" }),
};
