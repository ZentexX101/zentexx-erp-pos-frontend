import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPublicSettingsData, fetchShopSettingsData, updateShopSettings } from "../providers/apiProviders/settingApiProvider";
import { getBusinessName, setBusinessName } from "../utils/businessName";

const SETTING_KEY = "settings";

// ✅ The business name from Settings > Shop (works before login). Shows the last known name at once,
// then the saved one; keeps the browser tab title and getBusinessName() in step.
export const useBusinessName = () => {
  const { data } = useQuery({
    queryKey: [SETTING_KEY, "public"],
    queryFn: fetchPublicSettingsData,
    staleTime: 10 * 60 * 1000,
  });
  const name = data?.businessName || getBusinessName();

  useEffect(() => {
    if (data?.businessName) setBusinessName(data.businessName);
  }, [data?.businessName]);

  return name;
};

// ✅ Shop-wide settings (the exchange form reads the Return / Replacement hint)
export const useShopSettingsData = () => {
  return useQuery({
    queryKey: [SETTING_KEY, "shop"],
    queryFn: fetchShopSettingsData,
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Save shop settings (main admin). A new business name shows everywhere right away.
export const useUpdateShopSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShopSettings,
    meta: { success: "Shop settings saved." },
    onSuccess: (saved) => {
      queryClient.setQueryData([SETTING_KEY, "shop"], saved);
      queryClient.setQueryData([SETTING_KEY, "public"], { businessName: saved.businessName });
      setBusinessName(saved.businessName);
    },
  });
};
