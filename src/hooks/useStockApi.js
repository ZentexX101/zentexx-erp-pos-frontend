import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStockData,
  fetchStockOptionsData,
  fetchStockSerialsData,
  syncStockProducts,
  updateStockPrices,
} from "../providers/apiProviders/stockApiProvider";
import { branchStorage } from "../services/branchStorage";

export const STOCK_KEY = "stock";

// Stock belongs to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of the branch's stock with the filtered totals (meta.summary)
// params: { search, category, brand, quantity, maxSalePrice, maxPurchasePrice, page, limit }
export const useStockData = (params) => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "list", params],
    queryFn: () => fetchStockData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ The whole filtered list in one go (up to 1000 rows), for printing / PDF
export const useFetchFullStock = () => {
  const queryClient = useQueryClient();
  return (filters) => {
    const params = { ...filters, page: 1, limit: 1000 };
    return queryClient.fetchQuery({
      queryKey: [STOCK_KEY, branchKey(), "list", params],
      queryFn: () => fetchStockData(params),
    });
  };
};

// ✅ In-stock products for pickers (purchase return, POS)
export const useStockOptionsData = (search = "") => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "options", search],
    queryFn: () => fetchStockOptionsData(search),
    placeholderData: keepPreviousData,
  });
};

// ✅ A product's IMEIs in stock; only loads once a product is given (enabled)
export const useStockSerialsData = (productId, supplier, { enabled = true } = {}) => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "serials", productId, supplier],
    queryFn: () => fetchStockSerialsData(productId, supplier),
    enabled: Boolean(productId) && enabled,
  });
};

// ✅ Sync products / update prices — each refreshes every stock query
const useStockMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [STOCK_KEY] }),
  });
};

export const useSyncStockProducts = () => useStockMutation(() => syncStockProducts());

export const useUpdateStockPrices = () => useStockMutation(({ id, data }) => updateStockPrices(id, data));
