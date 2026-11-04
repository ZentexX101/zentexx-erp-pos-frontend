import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../providers/apiProviders/preOrderApiProvider";
import { branchStorage } from "../services/branchStorage";

const PRE_ORDER_KEY = "preOrders";

// Bookings belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of bookings — params: { search, status, overdue, from, to, page, limit }
export const usePreOrdersData = (params) =>
  useQuery({ queryKey: [PRE_ORDER_KEY, branchKey(), "list", params], queryFn: () => api.fetchPreOrdersData(params), placeholderData: keepPreviousData });

// ✅ One booking
export const usePreOrderData = (id) => useQuery({ queryKey: [PRE_ORDER_KEY, branchKey(), "one", id], queryFn: () => api.fetchPreOrderData(id) });

// ✅ Who can be the seller
export const usePreOrderOptions = () => useQuery({ queryKey: [PRE_ORDER_KEY, branchKey(), "options"], queryFn: api.fetchPreOrderOptions });

// ✅ Products with no stock here, for the product grid
export const usePreOrderProducts = (params) =>
  useQuery({ queryKey: [PRE_ORDER_KEY, branchKey(), "products", params], queryFn: () => api.fetchPreOrderProducts(params), placeholderData: keepPreviousData });

// ✅ A booking touches payment methods and the customer's balance; selling it also stock, sales and the dashboard
const usePreOrderMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      [PRE_ORDER_KEY, "stock", "sales", "customers", "paymentMethods", "analytics"].forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] }),
      ),
  });
};

export const useCreatePreOrder = () => usePreOrderMutation(api.createPreOrder);
export const useUpdatePreOrder = () => usePreOrderMutation(api.updatePreOrder);
export const useAddPreOrderPayment = () => usePreOrderMutation(api.addPreOrderPayment);
export const useMarkPreOrderNotified = () => usePreOrderMutation(api.markPreOrderNotified);
export const useSellPreOrder = () => usePreOrderMutation(api.sellPreOrder);
export const useCancelPreOrder = () => usePreOrderMutation(api.cancelPreOrder);
