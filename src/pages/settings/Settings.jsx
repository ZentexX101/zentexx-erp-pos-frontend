import { useSearchParams } from "react-router";
import PageHeader from "../../components/common/layout/PageHeader";
import AccountDetails from "../../components/settings/AccountDetails";
import ChangePasswordForm from "../../components/settings/ChangePasswordForm";
import NotificationSettings from "../../components/settings/NotificationSettings";
import SessionsCard from "../../components/settings/SessionsCard";
import SettingsNav from "../../components/settings/SettingsNav";
import { SETTINGS_TABS } from "../../constants/settings";
import { useAuth } from "../../hooks/useAuth";

// Account + security settings. The open tab lives in the URL (?tab=security) so it can be linked to.
const Settings = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const requested = params.get("tab");
  const tab = SETTINGS_TABS.some((t) => t.key === requested) ? requested : SETTINGS_TABS[0].key;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account, how you sign in and your notifications." />

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SettingsNav active={tab} onChange={(key) => setParams({ tab: key }, { replace: true })} />

        <div className="min-w-0 max-w-4xl space-y-6">
          {tab === "account" && <AccountDetails user={user} />}
          {tab === "security" && (
            <>
              <ChangePasswordForm />
              <SessionsCard />
            </>
          )}
          {tab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
