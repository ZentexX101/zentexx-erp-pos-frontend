import { useEffect, useState } from "react";
import {
  LuBanknote,
  LuBriefcase,
  LuCalendarDays,
  LuCheck,
  LuClock,
  LuGift,
  LuHandCoins,
  LuLogIn,
  LuLogOut,
  LuScissors,
} from "react-icons/lu";
import { ATTENDANCE_STATUS, daySwatch } from "../../../constants/hr";
import {
  useCheckIn,
  useCheckOut,
  useMonthSheetData,
} from "../../../hooks/useHrApi";
import { todayInputValue } from "../../../utils/formatDate";
import {
  currentMonth,
  dutyLabel,
  minutesLabel,
  monthLabel,
  timeLabel,
  workedLabel,
} from "../../../utils/hr";
import { formatTaka } from "../../../utils/money";
import Button from "../../common/buttons/Button";
import AttendanceCalendar from "../AttendanceCalendar";
import HrStat from "../HrStat";
import MonthSwitcher from "../MonthSwitcher";

// The time now, kept fresh while the page is open
const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// One step of the day: a filled circle once it's done
const Step = ({ label, time, done, hint }) => (
  <div className="min-w-0 text-center">
    <span
      className={`mx-auto flex size-10 items-center justify-center rounded-full ${done ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30" : "bg-white text-slate-300 ring-2 ring-slate-200"}`}
      aria-hidden="true"
    >
      {done ? (
        <LuCheck className="size-4" />
      ) : (
        <LuCheck className="size-4" />
      )}
    </span>
    <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
    <p className="whitespace-nowrap text-lg font-bold tabular-nums text-slate-900">
      {time}
    </p>
    {hint && (
      <p className="mt-1 inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <LuClock className="size-3.5" aria-hidden="true" />
        {hint}
      </p>
    )}
  </div>
);

// Phones: check in / check out as two tiles side by side
const TimeTile = ({ icon, label, time, done, hint }) => {
  const IconTag = icon;
  return (
    <div
      className={`min-w-0 rounded-xl px-3 py-2.5 ring-1 ring-inset ${done ? "bg-emerald-50 ring-emerald-200" : "bg-slate-50 ring-slate-200"}`}
    >
      <p
        className={`flex items-center gap-1.5 text-xs font-medium ${done ? "text-emerald-700" : "text-slate-500"}`}
      >
        {done ? (
          <LuCheck className="size-3.5" aria-hidden="true" />
        ) : (
          <IconTag className="size-3.5" aria-hidden="true" />
        )}
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
        {time}
      </p>
      {hint && (
        <p className="text-[11px] font-semibold text-amber-700">{hint}</p>
      )}
    </div>
  );
};

// Today: the clock, how the day is going and one big button; then this month's money and calendar
const MyOverviewTab = ({ data, staffId, onError, onSeeTab }) => {
  const [month, setMonth] = useState(currentMonth());
  const { data: sheet } = useMonthSheetData({ month, staffId });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const now = useClock();
  const { attendance: row, user, month: pay } = data;
  const counts = sheet?.counts;

  const run = async (action) => {
    onError("");
    try {
      await action();
    } catch (err) {
      onError(err.message);
    }
  };

  // Late days are part of the days they came, and only weekly offs that have passed count (same as the Attendance tab)
  const today = todayInputValue();
  const offSoFar = sheet?.days.filter(
    (d) => d.status === "off" && d.day <= today,
  ).length;
  const monthRows = [
    ["present", counts?.present, "Came"],
    ["late", counts?.late, "Of those, late"],
    ["leave", counts?.leave],
    ["unpaid_leave", counts?.unpaidLeave],
    ["absent", counts?.absent],
    ["off", offSoFar],
  ];

  return (
    <>
      <section className="relative grid items-center gap-5 overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:gap-6 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        {/* The day: a calendar tile, the title and how it's going */}
        <div className="flex items-center gap-4 lg:border-r lg:border-slate-200 lg:pr-8">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 sm:flex" aria-hidden="true">
            <LuCalendarDays className="size-7" />
          </span>
          <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 sm:text-4xl">
            {staffId ? "Today" : timeLabel(now)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <span
              className={`size-2 shrink-0 rounded-full ${row && !row.checkOut ? "bg-emerald-500" : row ? "bg-slate-400" : "bg-amber-400"}`}
              aria-hidden="true"
            />
            <span>
              {staffId
                ? !row
                  ? "No check-in today"
                  : row.checkOut
                    ? "Done for today"
                    : "At work now"
                : !row
                  ? "You haven't checked in yet"
                  : row.checkOut
                    ? "All done for today"
                    : "You're checked in"}
              {user.dutyStart &&
                !row &&
                ` · Duty ${dutyLabel(user.dutyStart)}${user.dutyEnd ? ` – ${dutyLabel(user.dutyEnd)}` : ""}`}
            </span>
          </p>
          </div>
        </div>

        {/* Phones: the two times as tiles, with the hours under them */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-2">
            <TimeTile
              icon={LuLogIn}
              label="Check in"
              time={row ? timeLabel(row.checkIn) : "—"}
              done={Boolean(row)}
              hint={
                row?.lateMinutes > 0
                  ? `${minutesLabel(row.lateMinutes)} late`
                  : undefined
              }
            />
            <TimeTile
              icon={LuLogOut}
              label="Check out"
              time={row?.checkOut ? timeLabel(row.checkOut) : "—"}
              done={Boolean(row?.checkOut)}
            />
          </div>
          {row && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              {!row.checkOut && (
                <span
                  className="size-1.5 animate-pulse rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
              )}
              {row.checkOut ? "Worked" : "Working for"}{" "}
              <span className="font-semibold tabular-nums text-slate-800">
                {workedLabel(row.checkIn, row.checkOut ?? now)}
              </span>
            </p>
          )}
        </div>

        <div className="mx-auto hidden w-full max-w-md items-start gap-3 sm:flex">
          <Step
            label="Check in"
            time={row ? timeLabel(row.checkIn) : "—"}
            done={Boolean(row)}
            hint={
              row?.lateMinutes > 0
                ? `${minutesLabel(row.lateMinutes)} late`
                : undefined
            }
          />
          <div className="mt-[18px] min-w-6 flex-1">
            <div
              className={`h-1.5 rounded-full ${row?.checkOut ? "bg-emerald-500" : row ? "bg-gradient-to-r from-emerald-500 to-slate-200" : "bg-slate-200"}`}
            />
            {row?.checkOut && (
              <p className="mt-1 text-center text-xs font-medium text-slate-500">
                {workedLabel(row.checkIn, row.checkOut)}
              </p>
            )}
          </div>
          <Step
            label="Check out"
            time={row?.checkOut ? timeLabel(row.checkOut) : "—"}
            done={Boolean(row?.checkOut)}
          />
        </div>

        {(staffId || row?.checkOut) && (
          <div className="hidden items-center gap-3 justify-self-end lg:flex">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200" aria-hidden="true">
              <LuBriefcase className="size-6" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                {!staffId ? "Great work today!" : !row ? "Not checked in yet" : row.checkOut ? "Done for today" : "At work now"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {row ? `${row.checkOut ? "Worked" : "Working for"} ${workedLabel(row.checkIn, row.checkOut ?? now)}` : "Have a productive day!"}
              </p>
            </div>
          </div>
        )}

        {!staffId && (!row || !row.checkOut) && (
          <div className="lg:justify-self-end">
            {!row ? (
              <Button
                onClick={() => run(() => checkIn.mutateAsync())}
                loading={checkIn.isPending}
                className="h-14 w-full rounded-xl px-8 text-base lg:w-auto"
              >
                <LuLogIn className="size-5" aria-hidden="true" />
                Check In
              </Button>
            ) : (
              <Button
                onClick={() => run(() => checkOut.mutateAsync())}
                loading={checkOut.isPending}
                variant="secondary"
                className="h-14 w-full rounded-xl px-8 text-base lg:w-auto"
              >
                <LuLogOut className="size-5" aria-hidden="true" />
                Check Out
              </Button>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <HrStat
          label="Salary"
          value={formatTaka(pay.basic)}
          hint={monthLabel(pay.month)}
          icon={LuBanknote}
          accent="blue"
        />
        <HrStat
          label="Incentive so far"
          value={formatTaka(pay.incentive)}
          tone="text-emerald-600"
          hint={staffId ? "From their sales" : "From what you sold"}
          icon={LuGift}
          accent="green"
        />
        <HrStat
          label="Cut so far"
          value={formatTaka(pay.absentDeduction)}
          tone={pay.absentDeduction ? "text-red-600" : "text-slate-900"}
          hint={`${pay.counts.deductible} ${pay.counts.deductible === 1 ? "day" : "days"}`}
          icon={LuScissors}
          accent="red"
        />
        <HrStat
          label="Advance to return"
          value={formatTaka(pay.advanceOwed)}
          tone={pay.advanceOwed ? "text-amber-700" : "text-slate-900"}
          icon={LuHandCoins}
          accent="amber"
        />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        {/* Title and "See it day by day" on one line; the month under them on phones, beside them from sm */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="font-semibold text-slate-900">
            {staffId ? "Attendance calendar" : "My attendance"}
          </h2>
          <button
            type="button"
            onClick={() => onSeeTab("attendance")}
            className="ml-auto rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:ml-0 sm:px-3 sm:py-2 sm:text-slate-600 sm:hover:bg-slate-100 sm:hover:text-slate-900 sm:order-2"
          >
            See it day by day
          </button>
          <MonthSwitcher
            month={month}
            onChange={setMonth}
            className="w-full sm:order-3 sm:w-auto"
          />
          <span
            className="hidden sm:order-1 sm:block sm:flex-1"
            aria-hidden="true"
          />
        </div>

        {/* The month in numbers */}
        <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {monthRows.map(([key, value, label]) => (
            <li
              key={key}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-slate-300"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${daySwatch(key)}`}
                aria-hidden="true"
              />
              <span className="text-slate-600">
                {label ?? ATTENDANCE_STATUS[key].label}
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {value ?? 0}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          {sheet && (
            <AttendanceCalendar
              days={sheet.days}
              dutyEnd={sheet.user?.dutyEnd ?? user.dutyEnd}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default MyOverviewTab;
