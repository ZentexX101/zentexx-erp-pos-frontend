import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnalyticsOverviewData } from "../providers/apiProviders/analyticsApiProvider";

const overviewKey = (params) => ["analytics", "overview", params];

// ✅ The dashboard — params: { branch, from, to }. Refreshes itself every 5 minutes while the tab
// is visible (the backend caches each view for a minute, so many open dashboards stay cheap).
export const useAnalyticsOverviewData = (params, { enabled = true } = {}) => {
  return useQuery({
    queryKey: overviewKey(params),
    queryFn: () => fetchAnalyticsOverviewData(params),
    placeholderData: keepPreviousData,
    refetchInterval: 300000,
    refetchIntervalInBackground: false,
    enabled,
  });
};

// ✅ The Refresh button: asks the backend for fresh numbers (skipping its cache) into the same query
export const useRefreshAnalytics = (params) => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.fetchQuery({
      queryKey: overviewKey(params),
      queryFn: () => fetchAnalyticsOverviewData({ ...params, fresh: true }),
      staleTime: 0,
    });
};
