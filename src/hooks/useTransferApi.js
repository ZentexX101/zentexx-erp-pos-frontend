import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransfer,
  fetchTransferSerialsData,
  fetchTransferStockData,
  fetchTransfersData,
} from "../providers/apiProviders/transferApiProvider";
import { STOCK_KEY } from "./useStockApi";

const TRANSFER_KEY = "transfers";

// ✅ One page of transfers — params: { search, branch, direction, from, to, page, limit }
export const useTransfersData = (params) => {
  return useQuery({
    queryKey: [TRANSFER_KEY, "list", params],
    queryFn: () => fetchTransfersData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ The sending branch's in-stock products (waits until a branch is picked)
export const useTransferStockData = (branch, search = "") => {
  return useQuery({
    queryKey: [STOCK_KEY, "transfer", branch, search],
    queryFn: () => fetchTransferStockData(branch, search),
    enabled: Boolean(branch),
    placeholderData: keepPreviousData,
  });
};

// ✅ A product's IMEIs in the sending branch
export const useTransferSerialsData = (branch, product) => {
  return useQuery({
    queryKey: [STOCK_KEY, "transfer-serials", branch, product],
    queryFn: () => fetchTransferSerialsData(branch, product),
    enabled: Boolean(branch && product),
  });
};

// ✅ A transfer changes both branches' stock
export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTransfer(data),
    meta: { success: (t) => `${t?.transferNo ?? "Transfer"}: ${t?.totalQuantity ?? 0} pcs moved from ${t?.fromBranch?.name ?? ""} to ${t?.toBranch?.name ?? ""}.` },
    onSuccess: () => [TRANSFER_KEY, STOCK_KEY].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
