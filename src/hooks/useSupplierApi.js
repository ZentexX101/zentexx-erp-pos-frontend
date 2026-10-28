import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplier,
  deleteSupplier,
  fetchSupplierLedgerData,
  fetchSupplierOptionsData,
  fetchSuppliersData,
  updateSupplier,
} from "../providers/apiProviders/supplierApiProvider";

const SUPPLIER_KEY = "suppliers";

// ✅ One page of suppliers — params: { search, status, page, limit }
export const useSuppliersData = (params) => {
  return useQuery({
    queryKey: [SUPPLIER_KEY, "list", params],
    queryFn: () => fetchSuppliersData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active suppliers for dropdowns (purchase form)
export const useSupplierOptionsData = () => {
  return useQuery({
    queryKey: [SUPPLIER_KEY, "options"],
    queryFn: fetchSupplierOptionsData,
  });
};

// ✅ One page of a supplier's ledger with the period summary — params: { from, to, type, page, limit }
export const useSupplierLedgerData = (supplierId, params) => {
  return useQuery({
    queryKey: [SUPPLIER_KEY, "ledger", supplierId, params],
    queryFn: () => fetchSupplierLedgerData(supplierId, params),
    placeholderData: keepPreviousData,
  });
};

// ✅ The whole filtered period in one go (up to 1000 lines), for printing / PDF
export const useFetchFullSupplierLedger = () => {
  const queryClient = useQueryClient();
  return (supplierId, filters) => {
    const params = { ...filters, page: 1, limit: 1000 };
    return queryClient.fetchQuery({
      queryKey: [SUPPLIER_KEY, "ledger", supplierId, params],
      queryFn: () => fetchSupplierLedgerData(supplierId, params),
    });
  };
};

// ✅ Create / update / delete — each refreshes every supplier query (lists, options, ledgers)
const useSupplierMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SUPPLIER_KEY] }),
  });
};

export const useCreateSupplier = () => useSupplierMutation((data) => createSupplier(data));

export const useUpdateSupplier = () => useSupplierMutation(({ id, data }) => updateSupplier(id, data));

export const useDeleteSupplier = () => useSupplierMutation((id) => deleteSupplier(id));
