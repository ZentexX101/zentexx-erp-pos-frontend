import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Service sales work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — the invoice of a sold device, by invoice number or IMEI (404 when none)
// -> { sale, devices: [{ product, name, trackSerial, unitPrice, serials: [{ serial, services }] | quantity, usedByService }] }
export const lookupSaleForService = async (q) => {
  const response = await apiRequest(`/service-sales/lookup${toQueryString({ q })}`);
  return response.data;
};

// ✅ Fetch Function — one page of service sales
// params: { search, service, due, from, to, page, limit } -> { data, meta: { ...paging, summary: { count, total, paid, due, incentive } } }
export const fetchServiceSalesData = async (params) => {
  const response = await apiRequest(`/service-sales${toQueryString(params)}`);
  return response;
};

// ✅ Sell a service — data: { sale, product, serial | quantity, service, soldBy, discount, payments: [{ paymentMethod, amount }], note }
export const createServiceSale = async (data) => {
  const response = await apiRequest("/service-sales", { method: "POST", body: data });
  return response.data;
};
