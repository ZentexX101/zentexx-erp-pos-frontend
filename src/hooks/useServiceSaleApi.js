import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createServiceSale, fetchServiceSalesData, lookupSaleForService } from "../providers/apiProviders/serviceSaleApiProvider";
import { branchStorage } from "../services/branchStorage";

const SERVICE_SALE_KEY = "serviceSales";

// Service sales belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ Find a sold device's invoice (called on "Search", always fresh)
export const useLookupServiceSale = () => {
  const queryClient = useQueryClient();
  return (q) => queryClient.fetchQuery({ queryKey: [SERVICE_SALE_KEY, branchKey(), "lookup", q], queryFn: () => lookupSaleForService(q), staleTime: 0 });
};

// ✅ One page of service sales — params: { search, service, due, from, to, page, limit }
export const useServiceSalesData = (params) => {
  return useQuery({
    queryKey: [SERVICE_SALE_KEY, branchKey(), "list", params],
    queryFn: () => fetchServiceSalesData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A service sale changes the customer's balance, payment method balances and the dashboard
export const useCreateServiceSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createServiceSale(data),
    meta: { success: (saved) => `Service sale ${saved?.saleNo ?? ""} saved.` },
    onSuccess: () =>
      [SERVICE_SALE_KEY, "services", "customers", "paymentMethods", "insights"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
