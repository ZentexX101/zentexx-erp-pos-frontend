import { useEffect, useState } from "react";
import { LuBanknote, LuCheck, LuGift, LuHandCoins, LuLogIn, LuLogOut, LuScissors } from "react-icons/lu";
import { ATTENDANCE_STATUS } from "../../../constants/hr";
import { useCheckIn, useCheckOut, useMonthSheetData } from "../../../hooks/useHrApi";
import { todayInputValue } from "../../../utils/formatDate";
import { currentMonth, dutyLabel, minutesLabel, monthLabel, timeLabel, workedLabel } from "../../../utils/hr";
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
      className={`mx-auto flex size-9 items-center justify-center rounded-full ${done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
      aria-hidden="true"
    >
      {done ? <LuCheck className="size-4" /> : <span className="size-2 rounded-full bg-slate-300" />}
    </span>
    <p className="mt-1.5 text-xs font-medium text-slate-500">{label}</p>
    <p className="whitespace-nowrap text-sm font-bold tabular-nums text-slate-900">{time}</p>
    {hint && <p className="whitespace-nowrap text-[11px] font-medium text-amber-700">{hint}</p>}
  </div>
);

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
  const offSoFar = sheet?.days.filter((d) => d.status === "off" && d.day <= today).length;
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
      <section className="grid items-center gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div>
          <p className="text-4xl font-bold tracking-tight tabular-nums text-slate-900">{staffId ? "Today" : timeLabel(now)}</p>
          <p className="mt-1 text-sm text-slate-500">
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
            {user.dutyStart && !row && ` · Duty ${dutyLabel(user.dutyStart)}${user.dutyEnd ? ` – ${dutyLabel(user.dutyEnd)}` : ""}`}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-sm items-start gap-2">
          <Step
            label="Check in"
            time={row ? timeLabel(row.checkIn) : "—"}
            done={Boolean(row)}
            hint={row?.lateMinutes > 0 ? `${minutesLabel(row.lateMinutes)} late` : undefined}
          />
          <div className="mt-4 min-w-6 flex-1">
            <div className={`h-1 rounded-full ${row?.checkOut ? "bg-emerald-500" : row ? "bg-gradient-to-r from-emerald-500 to-slate-200" : "bg-slate-200"}`} />
            {row?.checkOut && <p className="mt-1 text-center text-xs font-medium text-slate-500">{workedLabel(row.checkIn, row.checkOut)}</p>}
          </div>
          <Step label="Check out" time={row?.checkOut ? timeLabel(row.checkOut) : "—"} done={Boolean(row?.checkOut)} />
        </div>

        {!staffId && (!row || !row.checkOut) && (
          <div className="lg:justify-self-end">
            {!row ? (
              <Button onClick={() => run(() => checkIn.mutateAsync())} loading={checkIn.isPending} className="h-14 w-full rounded-xl px-8 text-base lg:w-auto">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HrStat label="Salary" value={formatTaka(pay.basic)} hint={monthLabel(pay.month)} icon={LuBanknote} accent="blue" />
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

      <section className="grid gap-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">{staffId ? "Attendance" : "My attendance"}</h2>
            <MonthSwitcher month={month} onChange={setMonth} />
          </div>
          {sheet && <AttendanceCalendar days={sheet.days} />}
        </div>

        <div className="min-w-0 rounded-xl bg-slate-50 p-4 xl:self-start">
          <p className="text-[13px] font-semibold text-slate-900">{monthLabel(month)}</p>
          <ul className="mt-3 space-y-2.5">
            {monthRows.map(([key, value, label]) => (
              <li key={key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span className={`size-3 shrink-0 rounded ${ATTENDANCE_STATUS[key].cell}`} aria-hidden="true" />
                  <span className="truncate">{label ?? ATTENDANCE_STATUS[key].label}</span>
                </span>
                <span className="font-semibold tabular-nums text-slate-900">{value ?? 0}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onSeeTab("attendance")}
            className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:text-slate-900 hover:ring-slate-300"
          >
            See it day by day
          </button>
        </div>
      </section>
    </>
  );
};

export default MyOverviewTab;
