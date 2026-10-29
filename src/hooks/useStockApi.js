import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchStockData, fetchStockOptionsData, fetchStockSerialsData } from "../providers/apiProviders/stockApiProvider";
import { branchStorage } from "../services/branchStorage";

export const STOCK_KEY = "stock";

// Stock belongs to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of the branch's stock — params: { search, inStock, page, limit }
export const useStockData = (params) => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "list", params],
    queryFn: () => fetchStockData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ In-stock products for pickers (purchase return, POS)
export const useStockOptionsData = (search = "") => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "options", search],
    queryFn: () => fetchStockOptionsData(search),
    placeholderData: keepPreviousData,
  });
};

// ✅ A product's IMEIs in stock; only loads for IMEI products (enabled)
export const useStockSerialsData = (productId, supplier, { enabled = true } = {}) => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "serials", productId, supplier],
    queryFn: () => fetchStockSerialsData(productId, supplier),
    enabled: Boolean(productId) && enabled,
  });
};
