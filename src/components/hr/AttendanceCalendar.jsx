import { useEffect, useState } from "react";
import { DAY_LOOK, daySwatch, leaveTypeLabel } from "../../constants/hr";
import { formatDayMonth, formatWeekdayDate, ordinal, todayInputValue } from "../../utils/formatDate";
import { minutesLabel } from "../../utils/hr";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Seven days a row; from xl an eighth column holds the week's summary
const ROW = "grid grid-cols-7 gap-1.5 xl:gap-2 xl:grid-cols-[repeat(7,minmax(0,1fr))_10.5rem]";

const LEGEND = [
  ["present", "On time / present"],
  ["late", "Late"],
  ["absent", "Absent"],
  ["off", "Weekly off"],
  ["leave", "Leave"],
  ["unpaid_leave", "Unpaid leave"],
];

// "10:49a", "3:59p"
const shortTime = (moment) => {
  const d = new Date(moment);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}${h < 12 ? "a" : "p"}`;
};

const minutesOfDay = (moment) => {
  const d = new Date(moment);
  return d.getHours() * 60 + d.getMinutes();
};

const minutesOfTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// "5h 10m" (always hours, like a timesheet)
const hoursLabel = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

// The time now, kept fresh so an open day's hours keep counting
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// Everything a cell and its week need about one day
const describe = (d, { today, now, dutyEnd }) => {
  const came = Boolean(d.checkIn);
  const open = came && !d.checkOut && d.day === today;
  const end = d.checkOut ?? (open ? now : null);
  const worked = came && end ? Math.max(0, Math.round((new Date(end) - new Date(d.checkIn)) / 60000)) : 0;
  const early = d.checkOut && dutyEnd ? Math.max(0, minutesOfTime(dutyEnd) - minutesOfDay(d.checkOut)) : 0;
  return { came, open, worked, early, missingOut: came && !d.checkOut && !open };
};

// One day of the month
// joined: this is the first working day after the "before joining" days
// picked / onPick: phones tap a day to see its details under the calendar
const DayCell = ({ d, info, today, joined, picked, onPick }) => {
  const isToday = d.day === today;
  // Today with no check-in yet is "not in yet", not an empty future day
  const status = isToday && d.status === "upcoming" ? "not_yet" : d.status;
  const look = DAY_LOOK[status] ?? DAY_LOOK.upcoming;
  const faded = d.status === "before_joining";
  const pill = d.status === "late" ? `Late ${minutesLabel(d.lateMinutes)}` : look.label;
  const title = info.came
    ? `${pill} · ${shortTime(d.checkIn)} → ${d.checkOut ? shortTime(d.checkOut) : "no check-out"}`
    : faded
      ? "Before joining"
      : look.label || "No record";

  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      onClick={() => onPick(d.day)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(d.day))}
      aria-pressed={picked}
      className={`relative flex min-h-11 min-w-0 cursor-pointer flex-col rounded-lg p-1.5 text-left ring-1 ring-inset max-xl:items-center max-xl:justify-center max-sm:aspect-square sm:max-xl:h-14 xl:min-h-28 xl:cursor-default xl:rounded-xl xl:p-2.5 ${look.cell} ${
        isToday ? "ring-2 !ring-slate-800" : picked ? "max-xl:ring-2 max-xl:!ring-blue-500" : ""
      }`}
    >
      {/* The pill sits beside the date while it fits and drops under it in narrow cells */}
      <div className="flex flex-wrap items-start justify-between gap-1 max-xl:justify-center">
        <span
          className={`text-xs font-semibold tabular-nums xl:text-sm ${
            isToday ? "flex size-5 items-center justify-center rounded-md bg-slate-900 text-white xl:size-6" : faded ? "text-slate-400" : "text-slate-800"
          }`}
        >
          {Number(d.day.slice(8))}
        </span>
        {look.label && (
          <span className={`hidden whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-semibold xl:block ${look.pill}`}>{pill}</span>
        )}
      </div>

      {/* Phones: a dot says the day had a check-in; the colour says the rest */}
      {info.came && <span className={`mt-1 size-1.5 rounded-full xl:hidden ${d.status === "late" ? "bg-amber-500" : "bg-emerald-500"}`} />}

      {/* Wider screens: times, hours and anything off */}
      <div className="mt-auto hidden min-w-0 text-right xl:block">
        {info.came && (
          <>
            <p className="text-xs font-medium tabular-nums text-slate-700">
              {shortTime(d.checkIn)} → {d.checkOut ? shortTime(d.checkOut) : info.open ? "Open" : "—"}
            </p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-base font-bold tabular-nums text-slate-900">
              {info.missingOut ? <span className="text-xs font-semibold text-red-600">No check-out</span> : hoursLabel(info.worked)}
              {info.open && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-label="At work now" />}
            </p>
            {info.early > 0 && <p className="text-xs font-semibold text-red-600">Early {minutesLabel(info.early)}</p>}
            {joined && <p className="text-xs font-medium text-slate-500">Joined</p>}
          </>
        )}
        {joined && !info.came && <p className="text-xs font-medium text-slate-500">Joined</p>}
        {(d.status === "leave" || d.status === "unpaid_leave") && d.leaveType && (
          <p className="text-xs font-medium text-slate-600">{leaveTypeLabel(d.leaveType)}</p>
        )}
      </div>
    </div>
  );
};

// Phones: the tapped day in full under the calendar (the cells there only show colour)
const DayDetail = ({ d, info, today }) => {
  const isToday = d.day === today;
  const status = isToday && d.status === "upcoming" ? "not_yet" : d.status;
  const look = DAY_LOOK[status] ?? DAY_LOOK.upcoming;
  const pill = d.status === "late" ? `Late ${minutesLabel(d.lateMinutes)}` : look.label;
  const label = formatWeekdayDate(d.day, { short: true });
  const empty =
    d.status === "before_joining" ? "Before joining" : d.status === "upcoming" ? (isToday ? "No check-in yet" : "Nothing yet") : null;

  return (
    <div className={`mt-3 rounded-xl p-3 ring-1 ring-inset xl:hidden ${look.cell}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          {label}
          {isToday && <span className="ml-1.5 text-xs font-medium text-slate-500">· Today</span>}
        </p>
        {pill && <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${look.pill}`}>{pill}</span>}
      </div>

      {info.came ? (
        <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/80 px-2 py-1.5">
            <dt className="text-[11px] text-slate-500">Check in</dt>
            <dd className="text-sm font-semibold tabular-nums text-slate-900">{shortTime(d.checkIn)}</dd>
          </div>
          <div className="rounded-lg bg-white/80 px-2 py-1.5">
            <dt className="text-[11px] text-slate-500">Check out</dt>
            <dd className={`text-sm font-semibold tabular-nums ${info.missingOut ? "text-red-600" : "text-slate-900"}`}>
              {d.checkOut ? shortTime(d.checkOut) : info.open ? "Open" : "Missing"}
            </dd>
          </div>
          <div className="rounded-lg bg-white/80 px-2 py-1.5">
            <dt className="text-[11px] text-slate-500">Worked</dt>
            <dd className="flex items-center justify-center gap-1 text-sm font-bold tabular-nums text-slate-900">
              {info.missingOut ? "—" : hoursLabel(info.worked)}
              {info.open && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-label="At work now" />}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-1 text-sm text-slate-600">
          {(d.status === "leave" || d.status === "unpaid_leave") && d.leaveType ? leaveTypeLabel(d.leaveType) : empty ?? look.label}
        </p>
      )}
      {info.early > 0 && <p className="mt-2 text-xs font-semibold text-red-600">Left {minutesLabel(info.early)} early</p>}
    </div>
  );
};

// One week's totals: hours worked, days came / late / off / leave / absent
// compact: one line in the list under the calendar (smaller screens) instead of a box
const WeekSummary = ({ days, infos, today, compact = false }) => {
  const real = days.filter(Boolean);
  if (!real.length) return null;

  const first = real[0].day;
  const last = real[real.length - 1].day;
  const range = first === last ? formatDayMonth(first) : `${ordinal(Number(first.slice(8)))} – ${formatDayMonth(last)}`;
  const count = (...statuses) => real.filter((d) => statuses.includes(d.status)).length;
  // Weekly offs count once they've passed, same as the month's numbers above the calendar
  const offs = real.filter((d) => d.status === "off" && d.day <= today).length;
  const beforeJoining = real.every((d) => d.status === "before_joining");
  const minutes = real.reduce((sum, d) => sum + (infos.get(d.day)?.worked ?? 0), 0);
  const running = first <= today && today <= last;

  const facts = [
    [count("present", "late"), "came", "text-emerald-700"],
    [count("late"), "late", "text-red-600"],
    [count("leave", "unpaid_leave"), "leave", "text-blue-700"],
    [count("absent"), "absent", "text-red-600"],
    [offs, "weekly off", "text-teal-700"],
  ].filter(([n]) => n > 0);

  if (compact) {
    return (
      <li className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{range}</p>
          {beforeJoining ? (
            <p className="text-xs text-slate-400">Before joining</p>
          ) : facts.length > 0 ? (
            <p className="flex flex-wrap gap-x-2 text-xs font-medium">
              {facts.map(([n, label, tone]) => (
                <span key={label} className={tone}>
                  {n} {label}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-xs text-slate-400">{first > today ? "Upcoming" : "No record"}</p>
          )}
        </div>
        {minutes > 0 && (
          <p className="shrink-0 text-right text-base font-bold tabular-nums text-slate-900">
            {hoursLabel(minutes)}
            {running && <span className="block text-[11px] font-medium text-slate-500">so far</span>}
          </p>
        )}
      </li>
    );
  }

  return (
    <div className="h-full min-w-0 rounded-xl bg-white p-3 ring-1 ring-inset ring-slate-300">
      <p className="text-xs font-semibold text-slate-700">{range}</p>
      {minutes > 0 && (
        <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
          {hoursLabel(minutes)}
          {running && <span className="ml-1 text-xs font-medium text-slate-500">so far</span>}
        </p>
      )}
      {beforeJoining && <p className="mt-1 text-xs text-slate-400">Before joining</p>}
      {facts.length > 0 && (
        <p className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs font-medium">
          {facts.map(([n, label, tone]) => (
            <span key={label} className={tone}>
              {n} {label}
            </span>
          ))}
        </p>
      )}
    </div>
  );
};

// A person's month as a timesheet calendar: each day with its status, times and hours; a weekly summary
// beside each week (under the calendar on smaller screens). days: from the attendance sheet; dutyEnd: "18:00"
// for the early-leave minutes. Below xl the days are small coloured squares; tapping one shows it in full underneath.
const AttendanceCalendar = ({ days, dutyEnd }) => {
  const now = useNow();
  const today = todayInputValue();
  const blanks = days.length ? new Date(`${days[0].day}T00:00:00`).getDay() : 0;
  const cells = [...Array(blanks).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const infos = new Map(days.map((d) => [d.day, describe(d, { today, now, dutyEnd })]));
  // The day they started, when it falls in this month
  const joinedDay = days.find((d, i) => i > 0 && days[i - 1].status === "before_joining" && d.status !== "before_joining")?.day;
  // Phones: the day shown in full under the calendar; today when it's in this month, else the 1st
  const [pickedDay, setPickedDay] = useState(null);
  const picked = days.find((d) => d.day === pickedDay) ?? days.find((d) => d.day === today) ?? days[0];

  return (
    <div>
      {/* Each week is one row; on wide screens its summary is the 8th cell, so they always line up */}
      <div className={`${ROW} pb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 xl:text-xs xl:normal-case xl:tracking-normal xl:text-slate-600`}>
        {WEEK.map((name) => (
          <span key={name}>{name}</span>
        ))}
        <span className="hidden text-left xl:block">Weekly summary</span>
      </div>
      <div className="space-y-1.5 xl:space-y-2">
        {weeks.map((week, i) => (
          <div key={i} className={ROW}>
            {week.map((d, j) =>
              d ? (
                <DayCell
                  key={d.day}
                  d={d}
                  info={infos.get(d.day)}
                  today={today}
                  joined={d.day === joinedDay}
                  picked={d.day === picked?.day}
                  onPick={setPickedDay}
                />
              ) : (
                <div key={`blank-${j}`} className="rounded-xl bg-slate-50/60" />
              )
            )}
            <div className="hidden xl:block">
              <WeekSummary days={week} infos={infos} today={today} />
            </div>
          </div>
        ))}
      </div>

      {picked && <DayDetail d={picked} info={infos.get(picked.day)} today={today} />}

      {/* Smaller screens: the weekly summaries as one list under the calendar, a line per week */}
      <div className="xl:hidden">
        <p className="mt-4 pb-1.5 text-xs font-semibold text-slate-600">Weekly summary</p>
        <ul className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-inset ring-slate-200">
          {weeks.map((week, i) => (
            <WeekSummary key={i} days={week} infos={infos} today={today} compact />
          ))}
        </ul>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
        {LEGEND.map(([key, label]) => (
          <li key={key} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <span className={`size-2.5 rounded-full ${daySwatch(key)}`} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceCalendar;
