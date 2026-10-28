import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of categories
// params: { search, status, page, limit } -> { data, meta }
export const fetchCategoriesData = async (params) => {
  const response = await apiRequest(`/categories${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — active categories for dropdowns (all of them, names only)
export const fetchCategoryOptionsData = async () => {
  const response = await apiRequest("/categories/options");
  return response.data;
};

// ✅ Create category
export const createCategory = async (data) => {
  const response = await apiRequest("/categories", { method: "POST", body: data });
  return response.data;
};

// ✅ Update category
export const updateCategory = async (id, data) => {
  const response = await apiRequest(`/categories/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete category
export const deleteCategory = async (id) => {
  const response = await apiRequest(`/categories/${id}`, { method: "DELETE" });
  return response;
};
