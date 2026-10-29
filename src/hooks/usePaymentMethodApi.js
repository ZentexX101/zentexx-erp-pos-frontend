import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPaymentMethodTransaction,
  createPaymentMethod,
  deletePaymentMethod,
  fetchPaymentMethodOptionsData,
  fetchPaymentMethodStatementData,
  fetchPaymentMethodsData,
  updatePaymentMethod,
} from "../providers/apiProviders/paymentMethodApiProvider";
import { branchStorage } from "../services/branchStorage";

const PAYMENT_METHOD_KEY = "paymentMethods";

// Methods belong to a branch, so the key holds the branch a main admin entered;
// switching branches never shows the other branch's cached methods
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of payment methods — params: { search, status, page, limit }
export const usePaymentMethodsData = (params) => {
  return useQuery({
    queryKey: [PAYMENT_METHOD_KEY, branchKey(), "list", params],
    queryFn: () => fetchPaymentMethodsData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active methods for payment dropdowns (POS, purchase, payments)
export const usePaymentMethodOptionsData = () => {
  return useQuery({
    queryKey: [PAYMENT_METHOD_KEY, branchKey(), "options"],
    queryFn: fetchPaymentMethodOptionsData,
  });
};

// ✅ A method's statement for a period — params: { from, to }
export const usePaymentMethodStatementData = (methodId, params) => {
  return useQuery({
    queryKey: [PAYMENT_METHOD_KEY, branchKey(), "statement", methodId, params],
    queryFn: () => fetchPaymentMethodStatementData(methodId, params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Create / update / in / out / delete — each refreshes every payment method query
const usePaymentMethodMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYMENT_METHOD_KEY] }),
  });
};

export const useCreatePaymentMethod = () => usePaymentMethodMutation((data) => createPaymentMethod(data));

export const useUpdatePaymentMethod = () => usePaymentMethodMutation(({ id, data }) => updatePaymentMethod(id, data));

// direction: "in" | "out"
export const usePaymentMethodTransaction = () =>
  usePaymentMethodMutation(({ id, direction, data }) => addPaymentMethodTransaction(id, direction, data));

export const useDeletePaymentMethod = () => usePaymentMethodMutation((id) => deletePaymentMethod(id));
