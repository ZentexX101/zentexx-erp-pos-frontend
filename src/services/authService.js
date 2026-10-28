import { toQueryString } from "../utils/queryString";
import { apiRequest } from "./ApiRequestHandler";

export const authService = {
  // Account starts pending; returns the created user (no tokens)
  register: async ({ name, email, phone, password }) =>
    (await apiRequest("/auth/register", { method: "POST", body: { name, email, phone, password }, auth: false })).data,

  // identifier: phone number or email
  login: async ({ identifier, password, rememberMe }) =>
    (await apiRequest("/auth/login", { method: "POST", body: { identifier, password, rememberMe }, auth: false })).data,

  getMe: async () => (await apiRequest("/auth/me")).data,

  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  logoutAll: () => apiRequest("/auth/logout-all", { method: "POST" }),

  changePassword: ({ currentPassword, newPassword }) =>
    apiRequest("/auth/change-password", { method: "PATCH", body: { currentPassword, newPassword } }),

  forgotPassword: ({ email }) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),

  // Returns { resetToken }
  verifyOtp: async ({ email, otp }) =>
    (await apiRequest("/auth/verify-otp", { method: "POST", body: { email, otp }, auth: false })).data,

  resetPassword: ({ resetToken, newPassword }) =>
    apiRequest("/auth/reset-password", { method: "POST", body: { resetToken, newPassword }, auth: false }),

  // Admin: registration requests by status (pending | approved | rejected)
  // One page: { status, page, limit } -> { data, meta }
  getRegistrations: (params) => apiRequest(`/auth/registrations${toQueryString(params)}`),

  // branchId is required for manager / staff; null makes an admin a main admin
  approveRegistration: async (userId, role, branchId = null) =>
    (await apiRequest(`/auth/registrations/${userId}/approve`, { method: "PATCH", body: { role, branch: branchId } }))
      .data,

  rejectRegistration: async (userId, reason) =>
    (await apiRequest(`/auth/registrations/${userId}/reject`, { method: "PATCH", body: reason ? { reason } : {} })).data,
};
