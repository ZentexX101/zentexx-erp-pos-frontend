import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of brands
// params: { search, status, page, limit } -> { data, meta }
export const fetchBrandsData = async (params) => {
  const response = await apiRequest(`/brands${toQueryString(params)}`);
  return response;
};

// ✅ Create brand
export const createBrand = async (data) => {
  const response = await apiRequest("/brands", { method: "POST", body: data });
  return response.data;
};

// ✅ Update brand
export const updateBrand = async (id, data) => {
  const response = await apiRequest(`/brands/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete brand
export const deleteBrand = async (id) => {
  const response = await apiRequest(`/brands/${id}`, { method: "DELETE" });
  return response;
};
