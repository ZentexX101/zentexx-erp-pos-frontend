import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Notifications are per user (their branch, permissions and settings are applied on the backend)

// ✅ One page, newest first — params: { unread, type, group, page, limit }
export const fetchNotificationsData = async (params) => {
  const response = await apiRequest(`/notifications${toQueryString(params)}`);
  return response;
};

// ✅ How many are unread ({ count })
export const fetchUnreadCountData = async () => {
  const response = await apiRequest("/notifications/unread-count");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiRequest("/notifications/read-all", { method: "PATCH" });
  return response.data;
};

// ✅ The kinds this user can get, each with its on / off switch
export const fetchNotificationSettingsData = async () => {
  const response = await apiRequest("/notifications/settings");
  return response.data;
};

export const updateNotificationSetting = async (data) => {
  const response = await apiRequest("/notifications/settings", { method: "PATCH", body: data });
  return response.data;
};
