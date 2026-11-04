import { ATTENDANCE_STATUS, CALENDAR_LEGEND } from "../../constants/hr";
import { todayInputValue } from "../../utils/formatDate";
import { timeLabel } from "../../utils/hr";
import PersonCell from "./PersonCell";

const total = "whitespace-nowrap px-2 py-2 text-center text-sm font-semibold tabular-nums";

// A whole month for everyone: a row per person with their totals, then a coloured cell per day. The names stay
// in place while the days scroll sideways. A cell opens that day; a name opens the person's month.
const AttendanceRegister = ({ data, isLoading, onOpenDay, onOpenPerson }) => {
  const today = todayInputValue();
  const days = data?.rows[0]?.days ?? [];

  if (isLoading && !data) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />;
  if (!data?.rows.length)
    return (
      <p className="rounded-2xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
        No staff in this branch yet. Add them from the Staff page.
      </p>
    );

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="overflow-x-auto">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="sticky left-0 z-10 min-w-44 border-b border-slate-200 bg-slate-50 px-4 py-2 font-semibold">Staff</th>
              <th className="border-b border-slate-200 px-2 py-2 text-center text-xs font-semibold text-emerald-700" title="Present">
                Came
              </th>
              <th className="border-b border-slate-200 px-2 py-2 text-center text-xs font-semibold text-amber-700" title="Late">
                Late
              </th>
              <th className="border-b border-slate-200 px-2 py-2 text-center text-xs font-semibold text-blue-700" title="Paid and unpaid leave">
                Leave
              </th>
              <th className="border-b border-r border-slate-200 px-2 py-2 text-center text-xs font-semibold text-red-700" title="Absent">
                Absent
              </th>
              {days.map((d) => (
                <th key={d.day} className={`border-b border-slate-200 px-0.5 py-1.5 text-center font-semibold ${d.day === today ? "text-slate-900" : ""}`}>
                  <span className="block text-[10px] font-medium uppercase text-slate-400">{d.weekday.slice(0, 2)}</span>
                  <span className="block text-xs tabular-nums">{Number(d.day.slice(8))}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.user._id}>
                <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-4 py-2">
                  <button type="button" onClick={() => onOpenPerson(row.user)} title="See the month" className="text-left hover:opacity-80">
                    <PersonCell person={row.user} />
                  </button>
                </td>
                <td className={`${total} border-b border-slate-100 text-emerald-700`}>{row.counts.present}</td>
                <td className={`${total} border-b border-slate-100 text-amber-700`}>{row.counts.late}</td>
                <td className={`${total} border-b border-slate-100 text-blue-700`}>{row.counts.leave + row.counts.unpaidLeave}</td>
                <td className={`${total} border-b border-r border-slate-100 text-red-700`}>{row.counts.absent}</td>
                {row.days.map((d) => {
                  const meta = ATTENDANCE_STATUS[d.status];
                  const title = `${d.day}: ${meta.label}${d.checkIn ? `, ${timeLabel(d.checkIn)} – ${timeLabel(d.checkOut)}` : ""}`;
                  return (
                    <td key={d.day} className="border-b border-slate-100 px-0.5 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => d.day <= today && onOpenDay(d.day)}
                        title={title}
                        aria-label={title}
                        className={`flex size-7 items-center justify-center rounded-md text-[11px] font-bold ${meta.cell} ${d.day === today ? "ring-2 ring-slate-900" : ""} ${d.day <= today ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}
                      >
                        {meta.short}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 px-5 py-3">
        {CALENDAR_LEGEND.map((key) => (
          <li key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`flex size-5 items-center justify-center rounded text-[10px] font-bold ${ATTENDANCE_STATUS[key].cell}`} aria-hidden="true">
              {ATTENDANCE_STATUS[key].short}
            </span>
            {ATTENDANCE_STATUS[key].label}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AttendanceRegister;
