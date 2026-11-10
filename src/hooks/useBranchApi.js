import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  deleteBranch,
  fetchBranchesData,
  fetchBranchNamesData,
  fetchBranchOptionsData,
  fetchCurrentBranchData,
  updateBranch,
} from "../providers/apiProviders/branchApiProvider";

const BRANCH_KEY = "branches";

// ✅ One page of branches — params: { search, status, page, limit }
export const useBranchesData = (params) => {
  return useQuery({
    queryKey: [BRANCH_KEY, "list", params],
    queryFn: () => fetchBranchesData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Branches for dropdowns — status optional (e.g. only active ones)
export const useBranchOptionsData = (status) => {
  return useQuery({
    queryKey: [BRANCH_KEY, "options", status],
    queryFn: () => fetchBranchOptionsData(status),
  });
};

// ✅ Active branch names for any user (Transfer "To Branch")
export const useBranchNamesData = () => {
  return useQuery({
    queryKey: [BRANCH_KEY, "names"],
    queryFn: fetchBranchNamesData,
  });
};

// ✅ The branch this user works in
export const useCurrentBranchData = (branchId) => {
  return useQuery({
    queryKey: [BRANCH_KEY, "current", branchId],
    queryFn: fetchCurrentBranchData,
  });
};

// ✅ Create / update / delete — refresh every branch query, and staff (they show branch names)
const useBranchMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEY] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useCreateBranch = () => useBranchMutation((data) => createBranch(data), (saved) => `"${saved?.name ?? "Branch"}" created.`);

export const useUpdateBranch = () => useBranchMutation(({ id, data }) => updateBranch(id, data), (saved) => `"${saved?.name ?? "Branch"}" updated.`);

export const useDeleteBranch = () => useBranchMutation((id) => deleteBranch(id), "Branch deleted.");
