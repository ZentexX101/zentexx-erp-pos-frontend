import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of suppliers
// params: { search, status, page, limit } -> { data, meta }
export const fetchSuppliersData = async (params) => {
  const response = await apiRequest(`/suppliers${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — active suppliers for dropdowns (all of them, name and phone only)
export const fetchSupplierOptionsData = async () => {
  const response = await apiRequest("/suppliers/options");
  return response.data;
};

// ✅ Fetch Function — one page of a supplier's ledger (newest first)
// params: { from, to (YYYY-MM-DD), type, page, limit } -> { data: { supplier, summary, entries }, meta }
export const fetchSupplierLedgerData = async (supplierId, params) => {
  const response = await apiRequest(`/suppliers/${supplierId}/ledger${toQueryString(params)}`);
  return response;
};

// ✅ Create supplier — data: { name, phone, address, balanceType, initialBalance, status }
export const createSupplier = async (data) => {
  const response = await apiRequest("/suppliers", { method: "POST", body: data });
  return response.data;
};

// ✅ Update supplier
export const updateSupplier = async (id, data) => {
  const response = await apiRequest(`/suppliers/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete supplier
export const deleteSupplier = async (id) => {
  const response = await apiRequest(`/suppliers/${id}`, { method: "DELETE" });
  return response;
};
