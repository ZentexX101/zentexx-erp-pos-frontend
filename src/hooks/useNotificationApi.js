import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotificationSettingsData,
  fetchNotificationsData,
  fetchUnreadCountData,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationSetting,
} from "../providers/apiProviders/notificationApiProvider";

const NOTIFICATION_KEY = "notifications";

// New ones are picked up by asking every 30 seconds (and when the tab is opened again), so it works on
// any hosting. Nothing is asked while the tab is in the background.
const POLL_MS = 30_000;

// ✅ Unread count for the bell
export const useUnreadCountData = () =>
  useQuery({
    queryKey: [NOTIFICATION_KEY, "unread"],
    queryFn: fetchUnreadCountData,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });

// ✅ One page — params: { unread, type, group, page, limit }. enabled: e.g. only while the bell is open
export const useNotificationsData = (params, { enabled = true, poll = false } = {}) =>
  useQuery({
    queryKey: [NOTIFICATION_KEY, "list", params],
    queryFn: () => fetchNotificationsData(params),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: poll ? POLL_MS : false,
    refetchIntervalInBackground: false,
  });

const useNotificationMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: success ? { success } : undefined,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [NOTIFICATION_KEY] }),
  });
};

export const useMarkNotificationRead = () => useNotificationMutation((id) => markNotificationRead(id));

export const useMarkAllNotificationsRead = () => useNotificationMutation(() => markAllNotificationsRead()); // the bell count clearing is the feedback

// ✅ Settings: which kinds this user gets
export const useNotificationSettingsData = () =>
  useQuery({
    queryKey: [NOTIFICATION_KEY, "settings"],
    queryFn: fetchNotificationSettingsData,
  });

// Saving a switch changes what the lists and the count show, so everything is refreshed
export const useUpdateNotificationSetting = () => useNotificationMutation((data) => updateNotificationSetting(data));
