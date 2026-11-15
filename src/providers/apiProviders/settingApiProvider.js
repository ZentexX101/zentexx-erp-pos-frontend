import { apiRequest } from "../../services/ApiRequestHandler";

// ✅ Shop-wide settings -> { exchangeReturnHint: { enabled, days } }
export const fetchShopSettingsData = async () => {
  const response = await apiRequest("/settings/shop");
  return response.data;
};

// ✅ Save shop settings (main admin) — data: { exchangeReturnHint: { enabled?, days? } }
export const updateShopSettings = async (data) => {
  const response = await apiRequest("/settings/shop", { method: "PATCH", body: data });
  return response.data;
};
