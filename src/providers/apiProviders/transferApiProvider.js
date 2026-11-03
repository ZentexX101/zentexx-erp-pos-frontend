import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Transfers span two branches: main admins pass the branches, branch users are locked to their own

// ✅ Fetch Function — one page of transfers
// params: { search, branch, direction (sent | received), from, to, page, limit } -> { data, meta: { ...paging, summary } }
export const fetchTransfersData = async (params) => {
  const response = await apiRequest(`/transfers${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — the sending branch's in-stock products matching search (max 20)
export const fetchTransferStockData = async (branch, search) => {
  const response = await apiRequest(`/transfers/stock${toQueryString({ branch, search })}`);
  return response.data;
};

// ✅ Fetch Function — a product's IMEIs in the sending branch
export const fetchTransferSerialsData = async (branch, product) => {
  const response = await apiRequest(`/transfers/serials${toQueryString({ branch, product })}`);
  return response.data;
};

// ✅ Create transfer — data: { fromBranch, toBranch, items: [{ product, quantity | serials }], note }
export const createTransfer = async (data) => {
  const response = await apiRequest("/transfers", { method: "POST", body: data });
  return response.data;
};
