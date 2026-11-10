import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStaff,
  deleteStaff,
  fetchPermissionCatalogData,
  fetchStaffData,
  updateStaff,
} from "../providers/apiProviders/staffApiProvider";

const STAFF_KEY = "staff";

// ✅ One page of staff — params: { search, role, branch, status, page, limit }
export const useStaffData = (params) => {
  return useQuery({
    queryKey: [STAFF_KEY, "list", params],
    queryFn: () => fetchStaffData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Permission catalog for the staff form — rarely changes, so cache it longer
export const usePermissionCatalogData = () => {
  return useQuery({
    queryKey: [STAFF_KEY, "permissions"],
    queryFn: fetchPermissionCatalogData,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// ✅ Create / update / delete — each refreshes the staff lists
const useStaffMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [STAFF_KEY, "list"] }),
  });
};

export const useCreateStaff = () => useStaffMutation((data) => createStaff(data), (saved) => `${saved?.name ?? "Staff"} created${saved?.staffCode ? ` (Staff ID #${saved.staffCode})` : ""}.`);

export const useUpdateStaff = () => useStaffMutation(({ id, data }) => updateStaff(id, data), (saved) => `${saved?.name ?? "Staff"} updated.`);

export const useDeleteStaff = () => useStaffMutation((id) => deleteStaff(id), "Staff deleted.");
