import { useCallback, useRef, useState } from "react";
import { LuBell, LuCheckCheck, LuInbox } from "react-icons/lu";
import { Link } from "react-router";
import { isMainAdmin } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDismiss } from "../../hooks/useDismiss";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsData, useUnreadCountData } from "../../hooks/useNotificationApi";
import { useNotificationLink } from "../../hooks/useNotificationLink";
import Spinner from "../common/loaders/Spinner";
import NotificationItem from "./NotificationItem";

const LATEST = { page: 1, limit: 8 };

// The bell in the top bar: unread count, and the latest notifications in a panel.
// mode: "main" / "branch", for the "View all" page.
const NotificationBell = ({ mode }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const { data: unread } = useUnreadCountData();
  // The list loads when the panel opens, and keeps up while it stays open
  const { data, isLoading, error } = useNotificationsData(LATEST, { enabled: open, poll: open });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const linkOf = useNotificationLink();

  const count = unread?.count ?? 0;
  const items = data?.data ?? [];
  const allPath = mode === "branch" ? ROUTES.BRANCH_NOTIFICATIONS : ROUTES.NOTIFICATIONS;

  const openOne = (n) => {
    if (!n.read) markRead.mutate(n._id);
    close();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={count ? `Notifications, ${count} unread` : "Notifications"}
        title="Notifications"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
      >
        <LuBell className="size-4.5" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Notifications
              {count > 0 && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{count} new</span>}
            </p>
            {count > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
              >
                <LuCheckCheck className="size-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(28rem,calc(100dvh-10rem))] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="h-5 w-5 text-indigo-600" />
              </div>
            ) : error ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">{error.message}</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <LuInbox className="size-8 text-slate-300" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-600">You&apos;re all caught up</p>
                <p className="text-xs text-slate-500">New stock, sales and other updates will show here.</p>
              </div>
            ) : (
              items.map((n) => (
                <NotificationItem key={n._id} notification={n} link={linkOf(n)} onOpen={() => openOne(n)} showBranch={isMainAdmin(user)} compact />
              ))
            )}
          </div>

          <Link to={allPath} onClick={close} className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-sm font-semibold text-indigo-600 hover:bg-slate-100">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
