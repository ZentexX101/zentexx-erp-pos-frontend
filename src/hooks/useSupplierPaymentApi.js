import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplierPayment,
  fetchAllSupplierPaymentsData,
  fetchSupplierPaymentsData,
} from "../providers/apiProviders/supplierPaymentApiProvider";
import { branchStorage } from "../services/branchStorage";

const SUPPLIER_PAYMENT_KEY = "supplierPayments";

// Branch payments are keyed by the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of this branch's supplier payments — params: { search, supplier, from, to, page, limit }
export const useSupplierPaymentsData = (params) => {
  return useQuery({
    queryKey: [SUPPLIER_PAYMENT_KEY, branchKey(), "list", params],
    queryFn: () => fetchSupplierPaymentsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Main admin: one page of every branch's supplier payments — params add { branch }
export const useAllSupplierPaymentsData = (params) => {
  return useQuery({
    queryKey: [SUPPLIER_PAYMENT_KEY, "all", params],
    queryFn: () => fetchAllSupplierPaymentsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ A payment changes the supplier's balance and payment method balances too
export const useCreateSupplierPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSupplierPayment(data),
    onSuccess: () =>
      [SUPPLIER_PAYMENT_KEY, "suppliers", "paymentMethods"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
