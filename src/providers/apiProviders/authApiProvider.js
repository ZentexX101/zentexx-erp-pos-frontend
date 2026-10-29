import { apiRequest } from "../../services/ApiRequestHandler";

// ✅ Login — identifier is a phone number or email
export const loginUser = async ({ identifier, password, rememberMe }) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: { identifier, password, rememberMe },
    auth: false,
  });
  return response.data;
};

// ✅ Fetch Function — the logged-in user
export const fetchMeData = async () => {
  const response = await apiRequest("/auth/me");
  return response.data;
};

// ✅ Logout (this device)
export const logoutUser = async () => {
  const response = await apiRequest("/auth/logout", { method: "POST" });
  return response;
};

// ✅ Logout from all devices
export const logoutAllDevices = async () => {
  const response = await apiRequest("/auth/logout-all", { method: "POST" });
  return response;
};

// ✅ Change password
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await apiRequest("/auth/change-password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
  return response;
};

// ✅ Forgot password — sends an OTP to the email
export const forgotPassword = async ({ email }) => {
  const response = await apiRequest("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
  return response;
};

// ✅ Verify OTP — returns { resetToken }
export const verifyOtp = async ({ email, otp }) => {
  const response = await apiRequest("/auth/verify-otp", { method: "POST", body: { email, otp }, auth: false });
  return response.data;
};

// ✅ Reset password with the token from verifyOtp
export const resetPassword = async ({ resetToken, newPassword }) => {
  const response = await apiRequest("/auth/reset-password", {
    method: "POST",
    body: { resetToken, newPassword },
    auth: false,
  });
  return response;
};
