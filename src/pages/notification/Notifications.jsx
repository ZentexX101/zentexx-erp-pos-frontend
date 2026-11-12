import { useState } from "react";
import { LuCheckCheck, LuSettings2 } from "react-icons/lu";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Select from "../../components/common/forms/Select";
import PageHeader from "../../components/common/layout/PageHeader";
import NotificationList from "../../components/notification/NotificationList";
import { NOTIFICATION_GROUPS } from "../../constants/notification";
import { isMainAdmin } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsData, useUnreadCountData } from "../../hooks/useNotificationApi";
import { useNotificationLink } from "../../hooks/useNotificationLink";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];
const GROUP_OPTIONS = NOTIFICATION_GROUPS.map((group) => ({ value: group, label: group }));

// Every notification of this user, newest first: All / Unread, a group filter, paging (all on the backend)
const Notifications = ({ mode = "main" }) => {
  const { user } = useAuth();

  // all states
  const [tab, setTab] = useState("all");
  const [group, setGroup] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // call notification api (polls while the page is open)
  const params = { unread: tab === "unread" || undefined, group: group || undefined, page, limit };
  const { data, isLoading, error } = useNotificationsData(params, { poll: true });
  const { data: unread } = useUnreadCountData();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const linkOf = useNotificationLink();

  const count = unread?.count ?? 0;

  const pick = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        subtitle="Stock, sales, payments and HR updates for you"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`${mode === "branch" ? ROUTES.BRANCH_SETTINGS : ROUTES.SETTINGS}?tab=notifications`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LuSettings2 className="size-4" aria-hidden="true" />
              Choose what you get
            </Link>
            <Button onClick={() => markAllRead.mutate()} disabled={!count} loading={markAllRead.isPending}>
              <LuCheckCheck className="size-4" aria-hidden="true" />
              Mark all read
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Show">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => pick(setTab)(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              {t.label}
              {t.key === "unread" && count > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">{count}</span>}
            </button>
          ))}
        </div>
        <Select variant="filter" aria-label="Filter by group" placeholder="All kinds" options={GROUP_OPTIONS} value={group} onChange={(e) => pick(setGroup)(e.target.value)} />
      </div>

      <Alert>{error?.message}</Alert>

      <NotificationList
        items={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        filtered={tab === "unread" || Boolean(group)}
        linkOf={linkOf}
        onOpen={(n) => !n.read && markRead.mutate(n._id)}
        showBranch={isMainAdmin(user)}
        onPageChange={setPage}
        onLimitChange={pick(setLimit)}
      />
    </div>
  );
};

export default Notifications;
