import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// POS works in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — the POS product grid (stock rows, in-stock first)
// params: { search, category, brand, page, limit } -> { data, meta }
export const fetchPosProductsData = async (params) => {
  const response = await apiRequest(`/stock/pos${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — a scanned IMEI -> { serial, stock } (404 when it isn't in stock)
export const fetchSerialInStock = async (serial) => {
  const response = await apiRequest(`/stock/serial/${encodeURIComponent(serial)}`);
  return response.data;
};

// ✅ Fetch Function — staff for "Sold By"
export const fetchSaleStaffData = async () => {
  const response = await apiRequest("/sales/staff-options");
  return response.data;
};

// ✅ Fetch Function — one page of sales (kind "sale") or exchanges (kind "exchange")
// params: { search, customer, soldBy, due, from, to, page, limit } -> { data, meta: { ...paging, summary } }
export const fetchSalesData = async (params, kind = "sale") => {
  const response = await apiRequest(`${kind === "exchange" ? "/exchanges" : "/sales"}${toQueryString(params)}`);
  return response;
};

// ✅ Complete a sale
// data: { customer, soldBy, items: [{ product, quantity | serials, unitPrice }], discount, deliveryCharge, payments, note }
export const createSale = async (data) => {
  const response = await apiRequest("/sales", { method: "POST", body: data });
  return response.data;
};

// ✅ Complete an exchange — the sale fields plus tradeIns: [{ product, quantity | serials, value, salePrice }]
export const createExchange = async (data) => {
  const response = await apiRequest("/exchanges", { method: "POST", body: data });
  return response.data;
};

// ✅ Exchange form: an old device's IMEI -> { serial, inStock: { branch, product } | null,
//    sale: { invoiceNo, date, daysAgo, branch, customer, unitPrice, product } | null, preowned: product | null }
export const lookupExchangeDevice = async (serial) => {
  const response = await apiRequest(`/exchanges/device${toQueryString({ serial })}`);
  return response.data;
};

// ✅ Exchange form: the customer with this phone, or null
export const findExchangeCustomer = async (phone) => {
  const response = await apiRequest(`/exchanges/customer${toQueryString({ phone })}`);
  return response.data;
};

// ✅ Exchange form: the customer with this phone, or a new one — data: { name, phone }
export const quickExchangeCustomer = async (data) => {
  const response = await apiRequest("/exchanges/customer", { method: "POST", body: data });
  return response.data;
};

// ✅ Exchange form: the "Preowned" listing of a product (found or made) — data: { product, category }
export const makePreownedProduct = async (data) => {
  const response = await apiRequest("/exchanges/preowned-product", { method: "POST", body: data });
  return response.data;
};
