import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of the current branch's supplier payments
// params: { search, supplier, from, to, page, limit } -> { data, meta: { ...paging, summary: { count, amount } } }
export const fetchSupplierPaymentsData = async (params) => {
  const response = await apiRequest(`/supplier-payments${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — main admin: every branch's supplier payments (same params, plus branch)
export const fetchAllSupplierPaymentsData = async (params) => {
  const response = await apiRequest(`/supplier-payments/all${toQueryString(params)}`);
  return response;
};

// ✅ Create supplier payment — data: { supplier, payments: [{ paymentMethod, amount }], note }
export const createSupplierPayment = async (data) => {
  const response = await apiRequest("/supplier-payments", { method: "POST", body: data });
  return response.data;
};
