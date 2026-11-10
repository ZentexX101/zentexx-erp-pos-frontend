import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROLE_LABELS } from "../constants/roles";
import {
  approveRegistration,
  fetchRegistrationsData,
  rejectRegistration,
} from "../providers/apiProviders/registrationApiProvider";

const REGISTRATION_KEY = "registrations";

// ✅ One page of registration requests — params: { status, page, limit }
export const useRegistrationsData = (params) => {
  return useQuery({
    queryKey: [REGISTRATION_KEY, params],
    queryFn: () => fetchRegistrationsData(params),
    placeholderData: keepPreviousData,
  });
};

// ✅ Approve / reject — refresh the requests, and staff (an approved user becomes staff)
const useRegistrationMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REGISTRATION_KEY] });
      queryClient.invalidateQueries({ queryKey: ["staff", "list"] });
    },
  });
};

export const useApproveRegistration = () =>
  useRegistrationMutation(
    ({ userId, role, branchId }) => approveRegistration(userId, role, branchId),
    (approved, { role }) =>
      `${approved?.name ?? "User"} approved as ${ROLE_LABELS[role] ?? role}${approved?.branch ? ` at ${approved.branch.name}` : " (main admin)"}. They can sign in now.`
  );

export const useRejectRegistration = () => useRegistrationMutation(({ userId, reason }) => rejectRegistration(userId, reason), "Registration rejected.");
