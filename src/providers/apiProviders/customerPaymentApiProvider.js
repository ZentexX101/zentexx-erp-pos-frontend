import { CUSTOMER_PAYMENT_KINDS } from "../../constants/customerPayment";
import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// kind: "payment" (/customer-payments) or "payout" (/customer-payouts); both work the same way

// ✅ Fetch Function — one page of the current branch's customer payments / payouts
// params: { search, customer, from, to, page, limit } -> { data, meta: { ...paging, summary: { count, amount } } }
export const fetchCustomerPaymentsData = async (kind, params) => {
  const response = await apiRequest(`${CUSTOMER_PAYMENT_KINDS[kind].path}${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — main admin: every branch's (same params, plus branch)
export const fetchAllCustomerPaymentsData = async (kind, params) => {
  const response = await apiRequest(`${CUSTOMER_PAYMENT_KINDS[kind].path}/all${toQueryString(params)}`);
  return response;
};

// ✅ Create customer payment / payout — data: { customer, payments: [{ paymentMethod, amount }], note }
export const createCustomerPayment = async (kind, data) => {
  const response = await apiRequest(CUSTOMER_PAYMENT_KINDS[kind].path, { method: "POST", body: data });
  return response.data;
};
