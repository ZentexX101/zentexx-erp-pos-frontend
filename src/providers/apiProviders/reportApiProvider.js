import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — money in and out of the payment methods — params: { branch, from, to }
// -> { summary: { opening, inflow, outflow, net, closing }, inflows, outflows, accounts, notCash }
export const fetchDailyStatementData = async (params) => {
  const response = await apiRequest(`/reports/daily-statement${toQueryString(params)}`);
  return response.data;
};

// ✅ Fetch Function — profit & loss with the period just before it — params: { branch, from, to }
export const fetchProfitLossData = async (params) => {
  const response = await apiRequest(`/reports/profit-loss${toQueryString(params)}`);
  return response.data;
};
