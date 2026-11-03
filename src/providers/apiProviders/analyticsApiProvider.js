import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — the whole dashboard in one call
// params: { branch (main admins only), from, to, fresh (skip the 1-minute cache) } -> { counts, dues, sales, ..., charts, recent }
export const fetchAnalyticsOverviewData = async (params) => {
  const response = await apiRequest(`/analytics/overview${toQueryString(params)}`);
  return response.data;
};
