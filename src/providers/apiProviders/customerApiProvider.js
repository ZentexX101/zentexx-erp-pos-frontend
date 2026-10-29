import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of customers
// params: { search, status, page, limit } -> { data, meta }
export const fetchCustomersData = async (params) => {
  const response = await apiRequest(`/customers${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — active customers for dropdowns, matching search (max 20: name, phone, balance)
export const fetchCustomerOptionsData = async (search) => {
  const response = await apiRequest(`/customers/options${toQueryString({ search })}`);
  return response.data;
};

// ✅ Fetch Function — one page of a customer's ledger (newest first)
// params: { from, to (YYYY-MM-DD), type, page, limit } -> { data: { customer, summary, entries }, meta }
export const fetchCustomerLedgerData = async (customerId, params) => {
  const response = await apiRequest(`/customers/${customerId}/ledger${toQueryString(params)}`);
  return response;
};

// ✅ Create customer — data: { name, phone, address, balanceType, initialBalance, status }
export const createCustomer = async (data) => {
  const response = await apiRequest("/customers", { method: "POST", body: data });
  return response.data;
};

// ✅ Update customer
export const updateCustomer = async (id, data) => {
  const response = await apiRequest(`/customers/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete customer
export const deleteCustomer = async (id) => {
  const response = await apiRequest(`/customers/${id}`, { method: "DELETE" });
  return response;
};
