import { useCallback, useRef, useState } from "react";
import { LuCalendarDays, LuChevronDown } from "react-icons/lu";
import { useDismiss } from "../../../hooks/useDismiss";
import { PERIOD_OPTIONS } from "../../../utils/period";
import RangeCalendar from "./RangeCalendar";

// "2026-11-01" -> "1 Nov 2026"
const shortDay = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The dates a period covers: "1 Nov 2026 – 3 Nov 2026", one date, or "Every day so far"
const rangeText = ({ from, to }) => {
  if (!from && !to) return "Every day so far";
  if (from === to) return shortDay(from);
  return `${from ? shortDay(from) : "Start"} – ${to ? shortDay(to) : "Today"}`;
};

const PRESETS = PERIOD_OPTIONS.filter((option) => option.value !== "custom");

// One button with the period and its dates. Its popover: quick periods on the left (chips on phones)
// and a calendar showing the range. Clicking two days in the calendar applies them as a custom range;
// nothing is fetched until both days are picked.
// value: { period, from, to }; range: the { from, to } the period resolves to; onChange(next value)
const PeriodPicker = ({ value, range, onChange }) => {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(null); // first day clicked, waiting for the second
  const [hover, setHover] = useState(null); // day under the pointer, previews the range
  const ref = useRef(null);
  const close = useCallback(() => {
    setOpen(false);
    setStart(null);
    setHover(null);
  }, []);
  useDismiss(ref, open, close);

  const label = PERIOD_OPTIONS.find((option) => option.value === value.period)?.label;
  const pickedNothing = value.period === "custom" && !value.from && !value.to;

  const pickPreset = (period) => {
    onChange({ ...value, period });
    close();
  };

  // First click starts the range, the second ends it (either order) and applies it
  const pickDay = (day) => {
    if (!start) return setStart(day);
    const [from, to] = start <= day ? [start, day] : [day, start];
    onChange({ period: "custom", from, to });
    close();
  };

  // While picking: the range from the first day to the hovered one (either direction)
  const end = hover ?? start;
  const shown = start ? (start <= end ? { from: start, to: end } : { from: end, to: start }) : range;

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
      >
        <LuCalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="shrink-0 font-semibold text-slate-900">{label}</span>
        <span className="min-w-0 truncate text-slate-500">· {pickedNothing ? "Pick dates" : rangeText(range)}</span>
        <LuChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a period"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:left-auto sm:w-[34rem] sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Quick periods: 2-column chips on phones, a list beside the calendar from sm */}
            <div className="grid grid-cols-2 gap-1 border-b border-slate-100 p-2 sm:w-40 sm:shrink-0 sm:grid-cols-1 sm:content-start sm:border-b-0 sm:border-r">
              {PRESETS.map((option) => {
                const active = value.period === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => pickPreset(option.value)}
                    aria-pressed={active}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                      active ? "bg-brand font-semibold text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="min-w-0 flex-1 p-3">
              <RangeCalendar from={shown.from} to={shown.to} onPick={pickDay} onHover={start ? setHover : undefined} />
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                {start ? (
                  <>
                    <span className="font-semibold text-slate-800">{rangeText(shown)}</span> ·{" "}
                    {hover && hover !== start ? "click to confirm" : "now pick the last day"}
                  </>
                ) : (
                  "Pick two days for a custom range"
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodPicker;
