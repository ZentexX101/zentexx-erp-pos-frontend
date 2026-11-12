import { DEFAULT_NOTIFICATION_ICON, NOTIFICATION_GROUPS, NOTIFICATION_ICONS, NOTIFICATION_LEVEL_STYLES } from "../../constants/notification";
import { useNotificationSettingsData, useUpdateNotificationSetting } from "../../hooks/useNotificationApi";
import Alert from "../common/alerts/Alert";
import Toggle from "../common/forms/Toggle";
import Spinner from "../common/loaders/Spinner";
import SettingsCard from "./SettingsCard";

// Which kinds of notification this user gets, grouped, each with an on / off switch.
// Only kinds they're allowed to see are listed. Saved right away.
const NotificationSettings = () => {
  const { data: kinds = [], isLoading, error } = useNotificationSettingsData();
  const update = useUpdateNotificationSetting();
  const saving = update.isPending ? update.variables?.type : null;

  const groups = NOTIFICATION_GROUPS.map((group) => ({ group, kinds: kinds.filter((kind) => kind.group === group) })).filter((g) => g.kinds.length);

  return (
    <SettingsCard title="Notifications" description="Choose what shows in your bell. Busy ones, like every single sale, start off.">
      <Alert>{error?.message || update.error?.message}</Alert>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-5 w-5 text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ group, kinds: list }) => (
            <div key={group}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group}</h3>
              <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
                {list.map((kind) => {
                  const Icon = NOTIFICATION_ICONS[kind.type] ?? DEFAULT_NOTIFICATION_ICON;
                  return (
                    <li key={kind.type} className="flex items-center gap-3 px-4 py-3">
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${NOTIFICATION_LEVEL_STYLES[kind.level] ?? NOTIFICATION_LEVEL_STYLES.info}`}>
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{kind.label}</span>
                      {saving === kind.type && <Spinner className="h-4 w-4 text-indigo-600" />}
                      <Toggle checked={kind.enabled} label={kind.label} disabled={update.isPending} onChange={(enabled) => update.mutate({ type: kind.type, enabled })} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
};

export default NotificationSettings;
