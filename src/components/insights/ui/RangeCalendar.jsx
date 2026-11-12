import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { formatMonth, todayInputValue } from "../../../utils/formatDate";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Days are "YYYY-MM-DD" strings in local time, so they compare as text and match the API's dates
const keyOf = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const monthOf = (day) => {
  const [year, month] = (day || todayInputValue()).split("-").map(Number);
  return { year, month: month - 1 };
};

// A one-month calendar that shows a date range: start / end filled, the days between tinted.
// from, to: the range to show; onPick(day) for each clicked day; onHover(day | null) while the
// pointer moves over the days (lets the picker preview a range). Days after today can't be picked.
const RangeCalendar = ({ from, to, onPick, onHover = () => {} }) => {
  const [view, setView] = useState(() => monthOf(to || from));
  const today = todayInputValue();

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isCurrentMonth = keyOf(view.year, view.month, 1) === `${today.slice(0, 7)}-01`;

  const shift = (step) =>
    setView(({ year, month }) => {
      const date = new Date(year, month + step, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  return (
    <div className="w-full select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LuChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-slate-900">{formatMonth(first)}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:invisible"
        >
          <LuChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="py-1.5">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => onHover(null)}>
        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const key = keyOf(view.year, view.month, day);
          const isStart = key === from;
          const isEnd = key === to;
          const edge = isStart || isEnd;
          const between = from && to && key > from && key < to;
          const future = key > today;
          // The tint runs behind the range as one band; it rounds off at the start / end and at each week's edge
          const inBand = between || (from && to && from !== to && edge);
          const roundLeft = isStart || index % 7 === 0 || day === 1;
          const roundRight = isEnd || index % 7 === 6 || day === daysInMonth;
          const band = inBand ? `bg-slate-200/80 ${roundLeft ? "rounded-l-lg" : ""} ${roundRight ? "rounded-r-lg" : ""}` : "";
          return (
            <div key={key} className={band}>
              <button
                type="button"
                disabled={future}
                onClick={() => onPick(key)}
                onMouseEnter={() => !future && onHover(key)}
                aria-pressed={edge}
                aria-label={key}
                className={`relative mx-auto flex h-9 w-full items-center justify-center rounded-lg text-sm tabular-nums transition ${
                  edge
                    ? "bg-brand font-semibold text-white shadow-sm"
                    : future
                      ? "cursor-not-allowed text-slate-300"
                      : between
                        ? "font-medium text-slate-900 hover:bg-slate-300/70"
                        : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {day}
                {key === today && !edge && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand" aria-hidden="true" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RangeCalendar;
