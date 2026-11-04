import { ATTENDANCE_STATUS, CALENDAR_LEGEND } from "../../constants/hr";
import { timeLabel } from "../../utils/hr";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// A person's month as a coloured calendar, with its key. days: from the attendance sheet.
const AttendanceCalendar = ({ days }) => {
  const blanks = days.length ? new Date(`${days[0].day}T00:00:00`).getDay() : 0;
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {WEEK.map((name) => (
          <span key={name} className="py-1">
            {name}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const meta = ATTENDANCE_STATUS[d.status];
          const title = d.checkIn ? `${meta.label}: ${timeLabel(d.checkIn)} – ${timeLabel(d.checkOut)}` : meta.label;
          return (
            <span
              key={d.day}
              title={title}
              className={`flex aspect-square max-h-12 w-full items-center justify-center justify-self-center rounded-lg text-sm font-semibold tabular-nums ${meta.cell} ${d.day === today ? "ring-2 ring-slate-900" : ""}`}
            >
              {Number(d.day.slice(8))}
            </span>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {CALENDAR_LEGEND.map((key) => (
          <li key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`size-3 rounded ${ATTENDANCE_STATUS[key].cell}`} aria-hidden="true" />
            {ATTENDANCE_STATUS[key].label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceCalendar;
