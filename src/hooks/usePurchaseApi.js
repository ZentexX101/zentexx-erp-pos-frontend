import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchase,
  createPurchaseReturn,
  fetchPurchaseReturnsData,
  fetchPurchasesData,
} from "../providers/apiProviders/purchaseApiProvider";
import { branchStorage } from "../services/branchStorage";
import { STOCK_KEY } from "./useStockApi";

const PURCHASE_KEY = "purchases";
const PURCHASE_RETURN_KEY = "purchaseReturns";

// Purchases belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of purchases — params: { search, supplier, from, to, page, limit }
export const usePurchasesData = (params) => {
  return useQuery({
    queryKey: [PURCHASE_KEY, branchKey(), "list", params],
    queryFn: () => fetchPurchasesData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ One page of purchase returns
export const usePurchaseReturnsData = (params) => {
  return useQuery({
    queryKey: [PURCHASE_RETURN_KEY, branchKey(), "list", params],
    queryFn: () => fetchPurchaseReturnsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A purchase / return changes stock, the supplier's balance and payment method balances too
const usePurchaseMutation = (mutationFn, key) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      [key, STOCK_KEY, "suppliers", "paymentMethods"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};

export const useCreatePurchase = () => usePurchaseMutation((data) => createPurchase(data), PURCHASE_KEY);

export const useCreatePurchaseReturn = () => usePurchaseMutation((data) => createPurchaseReturn(data), PURCHASE_RETURN_KEY);
