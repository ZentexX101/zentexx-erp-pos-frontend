import { toQueryString } from "../utils/queryString";
import { apiRequest } from "./ApiRequestHandler";

export const branchService = {
  // One page: { search, status, page, limit } -> { data, meta }
  getBranches: (params) => apiRequest(`/branches${toQueryString(params)}`),

  // Branches for dropdowns (the backend's max page size, 100, is plenty for branches)
  getOptions: async ({ status } = {}) => (await apiRequest(`/branches${toQueryString({ status, limit: 100 })}`)).data,

  // The branch this user works in: their own, or the one a main admin entered (X-Branch-Id header)
  getCurrent: async () => (await apiRequest("/branches/current")).data,

  create: async (data) => (await apiRequest("/branches", { method: "POST", body: data })).data,

  update: async (id, data) => (await apiRequest(`/branches/${id}`, { method: "PATCH", body: data })).data,

  remove: (id) => apiRequest(`/branches/${id}`, { method: "DELETE" }),
};
