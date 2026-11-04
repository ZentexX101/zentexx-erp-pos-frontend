import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { currentMonth, monthLabel, shiftMonth } from "../../utils/hr";

const arrow =
  "flex size-9 items-center justify-center rounded-lg text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand/20 disabled:invisible";

// ‹ November 2026 › — no month picker to open. allowFuture: can go past this month (a salary change can).
const MonthSwitcher = ({ month, onChange, allowFuture = false }) => (
  <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
    <button type="button" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month" className={arrow}>
      <LuChevronLeft className="size-4" aria-hidden="true" />
    </button>
    <span className="min-w-36 text-center text-sm font-semibold text-slate-900">{monthLabel(month)}</span>
    <button
      type="button"
      onClick={() => onChange(shiftMonth(month, 1))}
      disabled={!allowFuture && month >= currentMonth()}
      aria-label="Next month"
      className={arrow}
    >
      <LuChevronRight className="size-4" aria-hidden="true" />
    </button>
  </div>
);

export default MonthSwitcher;
