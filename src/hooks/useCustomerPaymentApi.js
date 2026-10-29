import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerPayment,
  fetchAllCustomerPaymentsData,
  fetchCustomerPaymentsData,
} from "../providers/apiProviders/customerPaymentApiProvider";
import { branchStorage } from "../services/branchStorage";

const CUSTOMER_PAYMENT_KEY = "customerPayments";

// Branch rows are keyed by the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of this branch's customer payments / payouts — kind: "payment" | "payout"
export const useCustomerPaymentsData = (kind, params) => {
  return useQuery({
    queryKey: [CUSTOMER_PAYMENT_KEY, kind, branchKey(), "list", params],
    queryFn: () => fetchCustomerPaymentsData(kind, params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Main admin: one page of every branch's — params add { branch }
export const useAllCustomerPaymentsData = (kind, params) => {
  return useQuery({
    queryKey: [CUSTOMER_PAYMENT_KEY, kind, "all", params],
    queryFn: () => fetchAllCustomerPaymentsData(kind, params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A payment / payout changes the customer's balance and payment method balances too
export const useCreateCustomerPayment = (kind) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createCustomerPayment(kind, data),
    onSuccess: () =>
      [CUSTOMER_PAYMENT_KEY, "customers", "paymentMethods"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
