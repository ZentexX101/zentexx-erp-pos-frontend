import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — the order to return from, by invoice number or a sold IMEI (404 when none)
export const lookupSaleForReturn = async (q) => {
  const response = await apiRequest(`/sale-returns/lookup${toQueryString({ q })}`);
  return response.data;
};

// ✅ Fetch Function — one page of POS returns
// params: { search, customer, from, to, page, limit } -> { data, meta: { ...paging, summary: { count, total, refund } } }
export const fetchSaleReturnsData = async (params) => {
  const response = await apiRequest(`/sale-returns${toQueryString(params)}`);
  return response;
};

// ✅ Create a POS return — data: { sale, items: [{ product, quantity | serials }], refunds: [{ paymentMethod, amount }], note }
export const createSaleReturn = async (data) => {
  const response = await apiRequest("/sale-returns", { method: "POST", body: data });
  return response.data;
};
