import { LuCalendarCheck, LuCalendarDays, LuCalendarX, LuChevronLeft, LuChevronRight, LuClock, LuCoffee, LuPencil, LuPlane } from "react-icons/lu";
import { ATTENDANCE_STATUS, leaveTypeLabel } from "../../constants/hr";
import { todayInputValue } from "../../utils/formatDate";
import { dayLabel, dutyLabel, minutesLabel, shiftDay, timeLabel, workedLabel } from "../../utils/hr";
import Badge from "../common/data/Badge";
import HrStat from "./HrStat";
import PersonLink from "./PersonLink";

const arrow = "flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:invisible";

// Today, Yesterday, or any date; the chosen day is written out in full
const DayPicker = ({ day, onDay }) => {
  const today = todayInputValue();
  const yesterday = shiftDay(today, -1);
  const chip = (active) =>
    `rounded-lg border px-3 py-2 text-sm font-medium transition ${active ? "border-slate-300 bg-white text-slate-900 shadow-sm" : "border-transparent text-slate-500 hover:bg-white hover:text-slate-900"}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onDay(today)} aria-pressed={day === today} className={chip(day === today)}>
          Today
        </button>
        <button type="button" onClick={() => onDay(yesterday)} aria-pressed={day === yesterday} className={chip(day === yesterday)}>
          Yesterday
        </button>
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/70">
        <button type="button" onClick={() => onDay(shiftDay(day, -1))} aria-label="Previous day" className={arrow}>
          <LuChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <label className="relative flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <LuCalendarDays className="size-4 text-slate-500" aria-hidden="true" />
          <input
            type="date"
            aria-label="Pick a date"
            value={day}
            max={today}
            onChange={(e) => e.target.value && onDay(e.target.value)}
            className="w-32 cursor-pointer bg-transparent text-sm font-semibold outline-none"
          />
        </label>
        <button type="button" onClick={() => onDay(shiftDay(day, 1))} disabled={day >= today} aria-label="Next day" className={arrow}>
          <LuChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-sm font-medium text-slate-600">{dayLabel(day)}</p>
    </div>
  );
};

// What the Out column says when there's no check out yet
const outLabel = (row, isToday) => {
  if (row.checkOut) return <span className="font-semibold text-slate-900">{timeLabel(row.checkOut)}</span>;
  if (!row.checkIn) return <span className="text-slate-300">—</span>;
  return isToday ? <span className="font-medium text-emerald-700">Still in</span> : <span className="font-medium text-amber-700">Not marked</span>;
};

// One day in detail: how the day went, then everyone's times in plain columns
const AttendanceDayView = ({ day, onDay, data, isLoading, canManage, onEdit }) => {
  const isToday = day === todayInputValue();
  const s = data?.summary;
  const missing = isToday ? (s?.notYet ?? 0) : (s?.absent ?? 0);

  return (
    <>
      <DayPicker day={day} onDay={onDay} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <HrStat
          label="Came"
          value={`${s?.present ?? 0} of ${s?.staff ?? 0}`}
          tone="text-emerald-600"
          hint={s?.late ? `${s.late} of them late` : s?.present ? "All on time" : undefined}
          icon={LuCalendarCheck}
          accent="green"
        />
        <HrStat label="Late" value={s?.late ?? 0} tone={s?.late ? "text-amber-600" : "text-slate-900"} icon={LuClock} accent="amber" />
        <HrStat label="On leave" value={s?.leave ?? 0} tone={s?.leave ? "text-blue-600" : "text-slate-900"} icon={LuPlane} accent="blue" />
        <HrStat label={isToday ? "Not in yet" : "Absent"} value={missing} tone={missing ? "text-red-600" : "text-slate-900"} icon={LuCalendarX} accent="red" />
        <HrStat label="Weekly off" value={s?.off ?? 0} icon={LuCoffee} />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-48 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : data?.board.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No staff in this branch yet. Add them from the Staff page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Staff</th>
                  <th className="px-4 py-3 font-semibold">Duty</th>
                  <th className="px-4 py-3 font-semibold">In</th>
                  <th className="px-4 py-3 font-semibold">Out</th>
                  <th className="px-4 py-3 font-semibold">Worked</th>
                  <th className="px-4 py-3 font-semibold">Late by</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.board.map((row) => {
                  const meta = ATTENDANCE_STATUS[row.status];
                  return (
                    <tr key={row.user._id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <PersonLink person={row.user} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {row.user.dutyStart ? (
                          `${dutyLabel(row.user.dutyStart)}${row.user.dutyEnd ? ` – ${dutyLabel(row.user.dutyEnd)}` : ""}`
                        ) : (
                          <span className="text-slate-300">Not set</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                        {row.checkIn ? (
                          <span className="font-semibold text-slate-900">{timeLabel(row.checkIn)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">{outLabel(row, isToday)}</td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600">
                        {workedLabel(row.checkIn, row.checkOut) ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                        {row.lateMinutes > 0 ? (
                          <span className="font-medium text-amber-700">{minutesLabel(row.lateMinutes)}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge dot tone={meta.tone}>
                          {row.leaveType && !row.checkIn ? leaveTypeLabel(row.leaveType) : meta.label}
                        </Badge>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            aria-label={`Fix ${row.user.name}`}
                            title="Fix this day"
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <LuPencil className="size-4" aria-hidden="true" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default AttendanceDayView;
