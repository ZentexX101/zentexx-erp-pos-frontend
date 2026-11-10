import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReplacement, fetchReplacementsData, lookupSaleForReplacement, resolveReplacement } from "../providers/apiProviders/replacementApiProvider";
import { branchStorage } from "../services/branchStorage";
import { STOCK_KEY } from "./useStockApi";

const REPLACEMENT_KEY = "replacements";

// Replacements belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ Find the invoice (called on "Search", always fresh)
export const useLookupReplacement = () => {
  const queryClient = useQueryClient();
  return (q) => queryClient.fetchQuery({ queryKey: [REPLACEMENT_KEY, branchKey(), "lookup", q], queryFn: () => lookupSaleForReplacement(q), staleTime: 0 });
};

// ✅ One page of replacements — params: { search, status, from, to, page, limit }
export const useReplacementsData = (params) => {
  return useQuery({
    queryKey: [REPLACEMENT_KEY, branchKey(), "list", params],
    queryFn: () => fetchReplacementsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A replacement moves stock and the invoice, and a charge moves money
const useReplacementMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () =>
      [REPLACEMENT_KEY, "sales", "serviceSales", STOCK_KEY, "customers", "paymentMethods", "reports", "analytics"].forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] }),
      ),
  });
};

export const useCreateReplacement = () => useReplacementMutation(createReplacement, (saved) => `Replacement ${saved?.replacementNo ?? ""} saved.`);
export const useResolveReplacement = () => useReplacementMutation(resolveReplacement, "Faulty piece resolved.");
