import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomerLedgerData,
  fetchCustomerOptionsData,
  fetchCustomersData,
  updateCustomer,
} from "../providers/apiProviders/customerApiProvider";

const CUSTOMER_KEY = "customers";

// ✅ One page of customers — params: { search, status, page, limit }
export const useCustomersData = (params) => {
  return useQuery({
    queryKey: [CUSTOMER_KEY, "list", params],
    queryFn: () => fetchCustomersData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active customers for dropdowns (POS / payment form), searched on the backend — max 20
export const useCustomerOptionsData = (search = "") => {
  return useQuery({
    queryKey: [CUSTOMER_KEY, "options", search],
    queryFn: () => fetchCustomerOptionsData(search),
    placeholderData: keepPreviousData,
  });
};

// ✅ One page of a customer's ledger with the period summary — params: { from, to, type, page, limit }
export const useCustomerLedgerData = (customerId, params) => {
  return useQuery({
    queryKey: [CUSTOMER_KEY, "ledger", customerId, params],
    queryFn: () => fetchCustomerLedgerData(customerId, params),
    placeholderData: keepPreviousData,
  });
};

// ✅ The whole filtered period in one go (up to 1000 lines), for printing / PDF
export const useFetchFullCustomerLedger = () => {
  const queryClient = useQueryClient();
  return (customerId, filters) => {
    const params = { ...filters, page: 1, limit: 1000 };
    return queryClient.fetchQuery({
      queryKey: [CUSTOMER_KEY, "ledger", customerId, params],
      queryFn: () => fetchCustomerLedgerData(customerId, params),
    });
  };
};

// ✅ Create / update / delete — each refreshes every customer query (lists, options, ledgers)
const useCustomerMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] }),
  });
};

export const useCreateCustomer = () => useCustomerMutation((data) => createCustomer(data));

export const useUpdateCustomer = () => useCustomerMutation(({ id, data }) => updateCustomer(id, data));

export const useDeleteCustomer = () => useCustomerMutation((id) => deleteCustomer(id));
