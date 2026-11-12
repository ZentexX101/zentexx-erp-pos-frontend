import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../providers/apiProviders/repairApiProvider";
import { branchStorage } from "../services/branchStorage";

const REPAIR_KEY = "repairs";

// Jobs belong to a branch, so the key holds the branch a main admin entered
const branchKey = () => branchStorage.getId() ?? "own";

// ✅ One page of jobs — params: { search, status, technician, overdue, from, to, page, limit }
export const useRepairsData = (params) =>
  useQuery({ queryKey: [REPAIR_KEY, branchKey(), "list", params], queryFn: () => api.fetchRepairsData(params), placeholderData: keepPreviousData });

// ✅ One job
export const useRepairData = (id) => useQuery({ queryKey: [REPAIR_KEY, branchKey(), "one", id], queryFn: () => api.fetchRepairData(id) });

// ✅ Who can be the technician
export const useRepairOptions = () => useQuery({ queryKey: [REPAIR_KEY, branchKey(), "options"], queryFn: api.fetchRepairOptions });

// ✅ Where an IMEI was sold, and its earlier repairs
export const useRepairDevice = (imei) =>
  useQuery({ queryKey: [REPAIR_KEY, branchKey(), "device", imei], queryFn: () => api.fetchRepairDevice(imei), enabled: Boolean(imei) });

// ✅ A job's money touches payment methods, the customer's balance and the dashboard
const useRepairMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => [REPAIR_KEY, "customers", "paymentMethods", "insights"].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};

export const useCreateRepair = () => useRepairMutation(api.createRepair, "Repair job created.");
export const useUpdateRepair = () => useRepairMutation(api.updateRepair, "Repair job updated.");
export const useUpdateRepairStatus = () => useRepairMutation(api.updateRepairStatus, "Repair status updated.");
export const useAddRepairCost = () => useRepairMutation(api.addRepairCost, "Repair cost added.");
export const useRemoveRepairCost = () => useRepairMutation(api.removeRepairCost, "Repair cost removed.");
export const useAddRepairPayment = () => useRepairMutation(api.addRepairPayment, "Repair payment added.");
export const useCloseRepair = () => useRepairMutation(api.closeRepair, "Repair job closed.");
