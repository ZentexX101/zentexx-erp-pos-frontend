import { apiRequest } from "../../services/ApiRequestHandler";

// ✅ Public (no login): what the login page shows -> { businessName }
export const fetchPublicSettingsData = async () => {
  const response = await apiRequest("/settings/public", { auth: false });
  return response.data;
};

// ✅ Shop-wide settings -> { businessName, exchangeReturnHint: { enabled, days } }
export const fetchShopSettingsData = async () => {
  const response = await apiRequest("/settings/shop");
  return response.data;
};

// ✅ Save shop settings (main admin) — data: { businessName?, exchangeReturnHint?: { enabled?, days? } }
export const updateShopSettings = async (data) => {
  const response = await apiRequest("/settings/shop", { method: "PATCH", body: data });
  return response.data;
};
