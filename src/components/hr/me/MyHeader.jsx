import { LuBuilding2, LuCalendarDays, LuIdCard } from "react-icons/lu";
import { dayLabel } from "../../../utils/hr";
import { getInitials } from "../../../utils/initials";

const Chip = ({ icon, children }) => {
  const Icon = icon;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/70">
      <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
};

// Who this page belongs to: a soft banner with their initials, job and branch
const MyHeader = ({ user, today, branchName, title }) => (
  <section className="flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 p-5 ring-1 ring-slate-200/70 sm:p-6">
    <span
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 sm:size-16 sm:text-xl"
      aria-hidden="true"
    >
      {getInitials(user.name)}
    </span>
    <div className="min-w-0">
      <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip icon={LuCalendarDays}>{dayLabel(today)}</Chip>
        {user.designation && <Chip icon={LuIdCard}>{user.designation}</Chip>}
        {!user.designation && user.staffCode && <Chip icon={LuIdCard}>ID {user.staffCode}</Chip>}
        {branchName && <Chip icon={LuBuilding2}>{branchName}</Chip>}
      </div>
    </div>
  </section>
);

export default MyHeader;
