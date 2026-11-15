import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchShopSettingsData, updateShopSettings } from "../providers/apiProviders/settingApiProvider";

const SETTING_KEY = "settings";

// ✅ Shop-wide settings (the exchange form reads the Return / Replacement hint)
export const useShopSettingsData = () => {
  return useQuery({
    queryKey: [SETTING_KEY, "shop"],
    queryFn: fetchShopSettingsData,
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Save shop settings (main admin)
export const useUpdateShopSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShopSettings,
    meta: { success: "Shop settings saved." },
    onSuccess: (saved) => queryClient.setQueryData([SETTING_KEY, "shop"], saved),
  });
};
