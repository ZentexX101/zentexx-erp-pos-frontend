import { toQueryString } from "../utils/queryString";
import { apiRequest } from "./ApiRequestHandler";

export const categoryService = {
  // One page: { search, status, page, limit } -> { data, meta }
  getCategories: (params) => apiRequest(`/categories${toQueryString(params)}`),

  create: async (data) => (await apiRequest("/categories", { method: "POST", body: data })).data,

  update: async (id, data) => (await apiRequest(`/categories/${id}`, { method: "PATCH", body: data })).data,

  remove: (id) => apiRequest(`/categories/${id}`, { method: "DELETE" }),
};
