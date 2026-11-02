import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of the branch's expenses
// params: { search, type, category, from, to, page, limit } -> { data, meta: { ...paging, summary: { count, total, byCategory } } }
export const fetchExpensesData = async (params) => {
  const response = await apiRequest(`/expenses${toQueryString(params)}`);
  return response;
};

// ✅ Create expense
// general: { type, title, category, date, payments: [{ paymentMethod, amount }], note }
// product: { type, title, category, date, items: [{ product, quantity | serials }], note }
export const createExpense = async (data) => {
  const response = await apiRequest("/expenses", { method: "POST", body: data });
  return response.data;
};
