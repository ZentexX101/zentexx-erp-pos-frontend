import { isMainAdmin, ROLE_LABELS } from "../../constants/roles";
import { formatDate } from "../../utils/formatDate";
import { getInitials } from "../../utils/initials";
import { formatPhone } from "../../utils/phone";
import Badge from "../common/data/Badge";
import SettingsCard from "./SettingsCard";

// Read-only profile; details are edited by an admin from Staff
const AccountDetails = ({ user }) => {
  const role = ROLE_LABELS[user.role] || user.role;
  const branch = user.branch?.name || (isMainAdmin(user) ? "All branches (main admin)" : "Not assigned");

  const details = [
    ["Full name", user.name],
    ["Phone", formatPhone(user.phone)],
    ["Email", user.email || "—"],
    ["Role", role],
    ["Branch", branch],
    ["Last sign-in", user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"],
  ];

  return (
    <SettingsCard
      title="Account"
      description="The details on your account."
      footer={<p className="mr-auto text-sm text-slate-500">Need a change? Ask an admin to update your profile.</p>}
    >
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-semibold text-white">
          {getInitials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">{user.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{role}</Badge>
            {user.branch && <span className="text-sm text-slate-500">{user.branch.name}</span>}
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </SettingsCard>
  );
};

export default AccountDetails;
