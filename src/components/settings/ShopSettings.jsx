import { useState } from "react";
import { useShopSettingsData, useUpdateShopSettings } from "../../hooks/useSettingApi";
import { toIntegerInput } from "../../utils/number";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import ToggleField from "../common/forms/ToggleField";
import Spinner from "../common/loaders/Spinner";
import SettingsCard from "./SettingsCard";

// The form, filled once the saved settings are loaded
const ShopSettingsForm = ({ saved }) => {
  const update = useUpdateShopSettings();
  const [enabled, setEnabled] = useState(saved.exchangeReturnHint.enabled);
  const [days, setDays] = useState(String(saved.exchangeReturnHint.days));
  const dayCount = Number(days);
  const invalid = enabled && (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 365);
  const changed = enabled !== saved.exchangeReturnHint.enabled || (enabled && dayCount !== saved.exchangeReturnHint.days);

  const handleSave = () => update.mutate({ exchangeReturnHint: enabled ? { enabled, days: dayCount } : { enabled } });

  return (
    <SettingsCard
      title="Exchange"
      description="Rules for the exchange / buyback form. They apply to every branch."
      footer={
        <Button onClick={handleSave} loading={update.isPending} disabled={!changed || invalid}>
          Save
        </Button>
      }
    >
      <div className="space-y-4">
        <Alert>{update.error?.message}</Alert>
        <ToggleField
          label="Suggest POS Return / Replacement for recent sales"
          description="When an old device's IMEI was sold by us within the days below, the exchange form suggests a POS Return or Replacement instead."
          checked={enabled}
          onChange={setEnabled}
        />
        <label className={`flex flex-wrap items-center gap-3 text-sm ${enabled ? "" : "opacity-50"}`}>
          <span className="font-medium text-slate-700">Sold within</span>
          <input
            inputMode="numeric"
            value={days}
            disabled={!enabled}
            onChange={(e) => setDays(toIntegerInput(e.target.value))}
            aria-label="Days"
            className="h-10 w-20 rounded-lg border border-slate-300 bg-white px-3 text-center text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-brand/10 disabled:bg-slate-50"
          />
          <span className="text-slate-600">days</span>
          {invalid && <span className="text-xs text-red-600">Enter 1 to 365 days.</span>}
        </label>
      </div>
    </SettingsCard>
  );
};

// Settings > Shop (main admins): shop-wide rules
const ShopSettings = () => {
  const { data, isLoading, error } = useShopSettingsData();
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-5 w-5 text-indigo-600" />
      </div>
    );
  }
  if (error) return <Alert>{error.message}</Alert>;
  return <ShopSettingsForm key={data.updatedAt} saved={data} />;
};

export default ShopSettings;
