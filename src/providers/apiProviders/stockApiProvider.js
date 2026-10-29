import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Stock works in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of the branch's stock
// params: { search, inStock, page, limit } -> { data, meta }
export const fetchStockData = async (params) => {
  const response = await apiRequest(`/stock${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — in-stock products matching search, for pickers (max 20)
export const fetchStockOptionsData = async (search) => {
  const response = await apiRequest(`/stock/options${toQueryString({ search })}`);
  return response.data;
};

// ✅ Fetch Function — a product's IMEIs in stock (optionally only those bought from one supplier)
export const fetchStockSerialsData = async (productId, supplier) => {
  const response = await apiRequest(`/stock/${productId}/serials${toQueryString({ supplier })}`);
  return response.data;
};
