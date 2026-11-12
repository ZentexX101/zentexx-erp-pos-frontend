import { Link } from "react-router";
import { DEFAULT_NOTIFICATION_ICON, NOTIFICATION_ICONS, NOTIFICATION_LEVEL_STYLES } from "../../constants/notification";
import { formatDateTime, formatTimeAgo } from "../../utils/formatDate";

// One notification: kind icon (amber / red for warnings), title, message, branch and who did it, time.
// Unread ones are tinted with a dot. link: { to, onClick } from useNotificationLink, or undefined.
// onOpen(): called on click (marks it read). showBranch: name the branch (main admins see every branch).
const NotificationItem = ({ notification: n, link, onOpen, showBranch, compact = false }) => {
  const Icon = NOTIFICATION_ICONS[n.type] ?? DEFAULT_NOTIFICATION_ICON;
  const branches = (n.branches ?? []).map((b) => b?.name).filter(Boolean);
  const meta = [showBranch && branches.length ? branches.join(" → ") : null, n.actor?.name ? `by ${n.actor.name}` : null].filter(Boolean);

  const body = (
    <>
      <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${NOTIFICATION_LEVEL_STYLES[n.level] ?? NOTIFICATION_LEVEL_STYLES.info}`}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block break-words text-sm leading-snug ${n.read ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>{n.title}</span>
        {n.message && <span className={`mt-0.5 block break-words text-xs text-slate-600 ${compact ? "line-clamp-2" : ""}`}>{n.message}</span>}
        <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500">
          <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>
            {formatTimeAgo(n.createdAt)}
          </time>
          {meta.map((part) => (
            <span key={part}>· {part}</span>
          ))}
        </span>
      </span>
      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
    </>
  );

  const className = `flex w-full items-start gap-3 px-4 py-3 text-left transition focus:outline-none focus-visible:bg-slate-50 ${
    n.read ? "hover:bg-slate-50" : "bg-indigo-50/40 hover:bg-indigo-50/70"
  }`;

  return link ? (
    <Link
      to={link.to}
      onClick={() => {
        link.onClick?.();
        onOpen?.();
      }}
      className={className}
    >
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onOpen} className={className}>
      {body}
    </button>
  );
};

export default NotificationItem;
