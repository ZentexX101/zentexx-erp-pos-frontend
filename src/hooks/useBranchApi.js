import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  deleteBranch,
  fetchBranchesData,
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

// ✅ The branch this user works in
export const useCurrentBranchData = (branchId) => {
  return useQuery({
    queryKey: [BRANCH_KEY, "current", branchId],
    queryFn: fetchCurrentBranchData,
  });
};

// ✅ Create / update / delete — refresh every branch query, and staff (they show branch names)
const useBranchMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEY] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export const useCreateBranch = () => useBranchMutation((data) => createBranch(data));

export const useUpdateBranch = () => useBranchMutation(({ id, data }) => updateBranch(id, data));

export const useDeleteBranch = () => useBranchMutation((id) => deleteBranch(id));
