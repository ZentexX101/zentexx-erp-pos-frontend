import { LuBadgeCheck, LuBuilding2, LuCalendarClock, LuInfo, LuMail, LuPhone, LuUserRound } from "react-icons/lu";
import { isMainAdmin, ROLE_LABELS } from "../../constants/roles";
import { formatDate } from "../../utils/formatDate";
import { getInitials } from "../../utils/initials";
import { formatPhone } from "../../utils/phone";
import Badge from "../common/data/Badge";

// Read-only profile; details are edited by an admin from Staff.
// A cover strip with the avatar on it, contact chips, then the details as a grid of small tiles.
const AccountDetails = ({ user }) => {
  const role = ROLE_LABELS[user.role] || user.role;
  const branch = user.branch?.name || (isMainAdmin(user) ? "All branches (main admin)" : "Not assigned");
  const phone = formatPhone(user.phone);

  const details = [
    { label: "Full name", value: user.name, icon: LuUserRound },
    { label: "Phone", value: phone, icon: LuPhone },
    { label: "Email", value: user.email || "—", icon: LuMail },
    { label: "Role", value: role, icon: LuBadgeCheck },
    { label: "Branch", value: branch, icon: LuBuilding2 },
    { label: "Last sign-in", value: user.lastLoginAt ? formatDate(user.lastLoginAt) : "—", icon: LuCalendarClock },
  ];

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      {/* Cover + avatar */}
      <div className="h-24 bg-gradient-to-r from-slate-100 via-slate-50 to-blue-50 sm:h-28" aria-hidden="true" />
      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-semibold text-white shadow-md ring-4 ring-white sm:size-24 sm:text-3xl">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0 pb-1">
              <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">{user.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge>{role}</Badge>
                <span className="truncate text-sm text-slate-500">{branch}</span>
              </div>
            </div>
          </div>

          {/* Contact chips */}
          <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end sm:pb-1">
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <LuPhone className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              {phone}
            </span>
            {user.email && (
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                <LuMail className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details: hairline grid of tiles */}
      <dl className="-mb-px -mr-px grid border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-3 [&>*]:border-b [&>*]:border-r [&>*]:border-slate-100">
        {details.map((detail) => (
          <div key={detail.label} className="flex min-w-0 items-start gap-3 px-5 py-4 sm:px-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-100">
              <detail.icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-slate-500">{detail.label}</dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={detail.value}>
                {detail.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <p className="flex items-center gap-2 bg-slate-50/70 px-5 py-3 text-sm text-slate-500 sm:px-6">
        <LuInfo className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
        Need a change? Ask an admin to update your profile.
      </p>
    </section>
  );
};

export default AccountDetails;
