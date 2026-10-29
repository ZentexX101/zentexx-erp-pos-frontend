import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSale,
  fetchPosProductsData,
  fetchSaleStaffData,
  fetchSalesData,
  fetchSerialInStock,
} from "../providers/apiProviders/saleApiProvider";
import { branchStorage } from "../services/branchStorage";
import { STOCK_KEY } from "./useStockApi";

const SALE_KEY = "sales";

// Sales belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ The POS product grid — params: { search, category, brand, page, limit }
export const usePosProductsData = (params) => {
  return useQuery({
    queryKey: [STOCK_KEY, branchKey(), "pos", params],
    queryFn: () => fetchPosProductsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Look up a scanned IMEI (called on Enter, not as a query)
export const useFindSerial = () => {
  const queryClient = useQueryClient();
  return (serial) =>
    queryClient.fetchQuery({ queryKey: [STOCK_KEY, branchKey(), "serial", serial], queryFn: () => fetchSerialInStock(serial), staleTime: 0 });
};

// ✅ Staff for "Sold By"
export const useSaleStaffData = () => {
  return useQuery({
    queryKey: [SALE_KEY, branchKey(), "staff"],
    queryFn: fetchSaleStaffData,
  });
};

// ✅ One page of sales — params: { search, customer, soldBy, due, from, to, page, limit }
export const useSalesData = (params) => {
  return useQuery({
    queryKey: [SALE_KEY, branchKey(), "list", params],
    queryFn: () => fetchSalesData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A sale changes stock, the customer's balance and payment method balances too
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSale(data),
    onSuccess: () =>
      [SALE_KEY, STOCK_KEY, "customers", "paymentMethods"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
