import { useState } from "react";
import { LuCalendarCheck, LuCalendarX, LuClock, LuCoffee, LuPlane } from "react-icons/lu";
import { ATTENDANCE_STATUS, leaveTypeLabel } from "../../../constants/hr";
import { useMonthSheetData } from "../../../hooks/useHrApi";
import { currentMonth, minutesLabel, shortDayLabel, timeLabel, workedLabel } from "../../../utils/hr";
import { todayInputValue } from "../../../utils/formatDate";
import Badge from "../../common/data/Badge";
import HrStat from "../HrStat";
import MonthSwitcher from "../MonthSwitcher";

const cell = "whitespace-nowrap px-4 py-3";

// A person's month in a table, newest day first. Only days up to today, plus any leave already approved ahead;
// days before joining are left out.
const MyAttendanceTab = ({ staffId }) => {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useMonthSheetData({ month, staffId });
  const c = data?.counts;
  const today = todayInputValue();
  const days = (data?.days ?? []).filter((d) => d.status !== "before_joining" && (d.day <= today || d.leaveType)).reverse();
  const offSoFar = days.filter((d) => d.status === "off").length;

  return (
    <>
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <HrStat label="Came" value={c?.present ?? 0} tone="text-emerald-600" icon={LuCalendarCheck} accent="green" />
        <HrStat label="Late" value={c?.late ?? 0} tone={c?.late ? "text-amber-600" : "text-slate-900"} icon={LuClock} accent="amber" />
        <HrStat
          label="Leave"
          value={(c?.leave ?? 0) + (c?.unpaidLeave ?? 0)}
          hint={c?.unpaidLeave ? `${c.unpaidLeave} unpaid` : undefined}
          tone="text-blue-600"
          icon={LuPlane}
          accent="blue"
        />
        <HrStat label="Absent" value={c?.absent ?? 0} tone={c?.absent ? "text-red-600" : "text-slate-900"} icon={LuCalendarX} accent="red" />
        <HrStat label="Weekly off" value={offSoFar} icon={LuCoffee} />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-48 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : days.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">Nothing in this month yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">In</th>
                  <th className="px-4 py-3 font-semibold">Out</th>
                  <th className="px-4 py-3 font-semibold">Worked</th>
                  <th className="px-4 py-3 font-semibold">Late by</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((d) => (
                  <tr key={d.day} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex size-10 shrink-0 flex-col items-center justify-center rounded-xl leading-none ${d.day === today ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          <span className="text-sm font-bold tabular-nums">{Number(d.day.slice(8))}</span>
                          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-70">{shortDayLabel(d.day).split(" ")[1]}</span>
                        </span>
                        <span className="text-sm font-medium capitalize text-slate-700">{d.weekday}</span>
                      </span>
                    </td>
                    <td className={`${cell} tabular-nums`}>
                      {d.checkIn ? <span className="font-semibold text-slate-900">{timeLabel(d.checkIn)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className={`${cell} tabular-nums`}>
                      {d.checkOut ? (
                        <span className="font-semibold text-slate-900">{timeLabel(d.checkOut)}</span>
                      ) : d.checkIn ? (
                        d.day === today ? (
                          <span className="font-medium text-emerald-700">Still in</span>
                        ) : (
                          <span className="font-medium text-amber-700">Not marked</span>
                        )
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={`${cell} tabular-nums text-slate-600`}>{workedLabel(d.checkIn, d.checkOut) ?? <span className="text-slate-300">—</span>}</td>
                    <td className={`${cell} tabular-nums`}>
                      {d.lateMinutes > 0 ? (
                        <span className="font-medium text-amber-700">{minutesLabel(d.lateMinutes)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={cell}>
                      <Badge dot tone={ATTENDANCE_STATUS[d.status].tone}>
                        {d.leaveType ? leaveTypeLabel(d.leaveType) : ATTENDANCE_STATUS[d.status].label}
                      </Badge>
                    </td>
                    <td className="max-w-56 truncate px-4 py-3 text-slate-500" title={d.note ?? undefined}>
                      {d.note ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default MyAttendanceTab;
