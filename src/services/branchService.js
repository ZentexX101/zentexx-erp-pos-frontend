import { apiRequest } from "./ApiRequestHandler";

export const branchService = {
  // { search, status } — both optional
  getBranches: async ({ search, status } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const query = params.toString();
    return (await apiRequest(`/branches${query ? `?${query}` : ""}`)).data;
  },

  // The branch this user works in: their own, or the one a main admin entered (X-Branch-Id header)
  getCurrent: async () => (await apiRequest("/branches/current")).data,

  create: async (data) => (await apiRequest("/branches", { method: "POST", body: data })).data,

  update: async (id, data) => (await apiRequest(`/branches/${id}`, { method: "PATCH", body: data })).data,

  remove: (id) => apiRequest(`/branches/${id}`, { method: "DELETE" }),
};
