import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Purchases work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of purchases
// params: { search, supplier, from, to, page, limit } -> { data, meta }
export const fetchPurchasesData = async (params) => {
  const response = await apiRequest(`/purchases${toQueryString(params)}`);
  return response;
};

// ✅ Create purchase
// data: { supplier, items: [{ product, quantity | serials, unitCost, salePrice }], paidAmount, paymentMethod, note }
export const createPurchase = async (data) => {
  const response = await apiRequest("/purchases", { method: "POST", body: data });
  return response.data;
};

// ✅ Fetch Function — one page of purchase returns (same params as purchases)
export const fetchPurchaseReturnsData = async (params) => {
  const response = await apiRequest(`/purchase-returns${toQueryString(params)}`);
  return response;
};

// ✅ Create purchase return — data: { supplier, items: [{ product, quantity + unitCost | serials }], note }
export const createPurchaseReturn = async (data) => {
  const response = await apiRequest("/purchase-returns", { method: "POST", body: data });
  return response.data;
};
