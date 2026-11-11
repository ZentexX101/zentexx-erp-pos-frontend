import { useEffect, useState } from "react";
import { LuBriefcaseBusiness, LuBuilding2, LuCalendarDays } from "react-icons/lu";
import { dayLabel, dutyLabel, timeLabel } from "../../../utils/hr";
import { getInitials } from "../../../utils/initials";
import AnalogClock from "../AnalogClock";

const Chip = ({ icon, children }) => {
  const Icon = icon;
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      <Icon className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </span>
  );
};

// The time now beside the clock (lg and up), with the duty hours when set
const LiveTime = ({ dutyStart, dutyEnd }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="hidden leading-tight lg:block">
      <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 lg:text-3xl">{timeLabel(now)}</p>
      {dutyStart && (
        <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Duty {dutyLabel(dutyStart)}
          {dutyEnd ? ` – ${dutyLabel(dutyEnd)}` : ""}
        </p>
      )}
    </div>
  );
};

// Who this page belongs to: initials (a green dot while they're at work), name, the day, job and branch;
// then a live clock with the time and duty hours. Phones: plain lines instead of chips, and just the clock.
const MyHeader = ({ user, today, branchName, title, online = false }) => (
  <section className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:gap-6 sm:p-5">
    {/* A soft wash behind the avatar */}
    <span className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-slate-100 to-transparent sm:w-72" aria-hidden="true" />

    <span className="relative shrink-0">
      <span
        className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 text-xl font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 sm:size-20 sm:text-3xl"
        aria-hidden="true"
      >
        {getInitials(user.name)}
      </span>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 ring-[3px] ring-white sm:size-5" title="At work now" />
      )}
    </span>

    <div className="relative min-w-0 flex-1">
      <h1 className="truncate text-xl font-bold capitalize tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {/* Phones: two quiet lines instead of chips */}
      <p className="truncate text-sm font-medium text-slate-600 sm:hidden">
        {[user.designation || (user.staffCode && `ID ${user.staffCode}`), branchName].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 sm:hidden">
        <LuCalendarDays className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        {new Date(`${today}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
      </p>
      <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
        <Chip icon={LuCalendarDays}>{dayLabel(today)}</Chip>
        {(user.designation || user.staffCode) && <Chip icon={LuBriefcaseBusiness}>{user.designation || `ID ${user.staffCode}`}</Chip>}
        {branchName && <Chip icon={LuBuilding2}>{branchName}</Chip>}
      </div>
    </div>

    {/* Clock and time side by side; a divider before them on wide screens */}
    <span className="hidden w-px self-stretch bg-slate-200 lg:block" aria-hidden="true" />
    <div className="relative flex shrink-0 items-center gap-4 lg:rounded-2xl lg:bg-slate-50 lg:py-3 lg:pl-3 lg:pr-6 lg:ring-1 lg:ring-inset lg:ring-slate-200">
      <AnalogClock dutyStart={user.dutyStart} dutyEnd={user.dutyEnd} className="size-12 sm:size-20" />
      <LiveTime dutyStart={user.dutyStart} dutyEnd={user.dutyEnd} />
    </div>
  </section>
);

export default MyHeader;
