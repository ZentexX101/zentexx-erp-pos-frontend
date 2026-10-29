import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSaleReturn, fetchSaleReturnsData, lookupSaleForReturn } from "../providers/apiProviders/saleReturnApiProvider";
import { branchStorage } from "../services/branchStorage";
import { STOCK_KEY } from "./useStockApi";

const SALE_RETURN_KEY = "saleReturns";

// Returns belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ Find the order to return from (called on "Search", always fresh)
export const useLookupSale = () => {
  const queryClient = useQueryClient();
  return (q) => queryClient.fetchQuery({ queryKey: [SALE_RETURN_KEY, branchKey(), "lookup", q], queryFn: () => lookupSaleForReturn(q), staleTime: 0 });
};

// ✅ One page of POS returns — params: { search, customer, from, to, page, limit }
export const useSaleReturnsData = (params) => {
  return useQuery({
    queryKey: [SALE_RETURN_KEY, branchKey(), "list", params],
    queryFn: () => fetchSaleReturnsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A return changes stock, the sale, the customer's balance and payment method balances
export const useCreateSaleReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSaleReturn(data),
    onSuccess: () =>
      [SALE_RETURN_KEY, "sales", STOCK_KEY, "customers", "paymentMethods"].forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      ),
  });
};
