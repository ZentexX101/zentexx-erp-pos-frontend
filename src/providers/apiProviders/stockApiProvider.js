import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Stock works in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of the branch's stock
// params: { search, category, brand, quantity, maxSalePrice, maxPurchasePrice, page, limit }
// -> { data, meta: { ...paging, summary: { products, quantity, value } } }
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

// ✅ Sync Products — give every active product a stock row (quantity 0) in this branch -> { added }
export const syncStockProducts = async () => {
  const response = await apiRequest("/stock/sync", { method: "POST" });
  return response.data;
};

// ✅ Update stock prices — data: { salePrice, purchasePrice (main admin only) }
export const updateStockPrices = async (id, data) => {
  const response = await apiRequest(`/stock/${id}`, { method: "PATCH", body: data });
  return response.data;
};
