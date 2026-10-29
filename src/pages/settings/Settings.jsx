import { useSearchParams } from "react-router";
import PageHeader from "../../components/common/layout/PageHeader";
import AccountDetails from "../../components/settings/AccountDetails";
import ChangePasswordForm from "../../components/settings/ChangePasswordForm";
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
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Settings" subtitle="Manage your account and how you sign in." />

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-4 lg:gap-8">
        <SettingsNav active={tab} onChange={(key) => setParams({ tab: key }, { replace: true })} />

        <div className="min-w-0 space-y-6 lg:col-span-3">
          {tab === "account" && <AccountDetails user={user} />}
          {tab === "security" && (
            <>
              <ChangePasswordForm />
              <SessionsCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
