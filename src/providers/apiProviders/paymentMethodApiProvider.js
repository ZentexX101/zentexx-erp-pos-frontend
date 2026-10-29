import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// All payment method calls work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of payment methods
// params: { search, status, page, limit } -> { data, meta }
export const fetchPaymentMethodsData = async (params) => {
  const response = await apiRequest(`/payment-methods${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — active methods for payment dropdowns (default first: name, balance, isDefault)
export const fetchPaymentMethodOptionsData = async () => {
  const response = await apiRequest("/payment-methods/options");
  return response.data;
};

// ✅ Fetch Function — a method's money in / out for a period
// params: { from, to (YYYY-MM-DD) } -> { paymentMethod, summary, inflows, outflows }
export const fetchPaymentMethodStatementData = async (methodId, params) => {
  const response = await apiRequest(`/payment-methods/${methodId}/statement${toQueryString(params)}`);
  return response.data;
};

// ✅ Create payment method — data: { name, description, initialBalance, status, isDefault }
export const createPaymentMethod = async (data) => {
  const response = await apiRequest("/payment-methods", { method: "POST", body: data });
  return response.data;
};

// ✅ Update payment method
export const updatePaymentMethod = async (id, data) => {
  const response = await apiRequest(`/payment-methods/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Put money in or take it out — direction: "in" | "out", data: { amount, note }
export const addPaymentMethodTransaction = async (id, direction, data) => {
  const response = await apiRequest(`/payment-methods/${id}/${direction}`, { method: "POST", body: data });
  return response.data;
};

// ✅ Delete payment method
export const deletePaymentMethod = async (id) => {
  const response = await apiRequest(`/payment-methods/${id}`, { method: "DELETE" });
  return response;
};
