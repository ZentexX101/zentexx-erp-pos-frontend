import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of registration requests
// params: { status: pending | approved | rejected, page, limit } -> { data, meta }
export const fetchRegistrationsData = async (params) => {
  const response = await apiRequest(`/auth/registrations${toQueryString(params)}`);
  return response;
};

// ✅ Approve registration
// branchId is required for a sub admin; null makes an admin a main admin
export const approveRegistration = async (userId, role, branchId = null) => {
  const response = await apiRequest(`/auth/registrations/${userId}/approve`, {
    method: "PATCH",
    body: { role, branch: branchId },
  });
  return response.data;
};

// ✅ Reject registration (reason optional)
export const rejectRegistration = async (userId, reason) => {
  const response = await apiRequest(`/auth/registrations/${userId}/reject`, {
    method: "PATCH",
    body: reason ? { reason } : {},
  });
  return response.data;
};
