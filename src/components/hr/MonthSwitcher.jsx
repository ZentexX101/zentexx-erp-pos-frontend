import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { currentMonth, monthLabel, shiftMonth } from "../../utils/hr";

const arrow =
  "flex size-9 items-center justify-center rounded-lg text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand/20 disabled:invisible";

// ‹ November 2026 › — no month picker to open. allowFuture: can go past this month (a salary change can).
// className: e.g. full width on phones
const MonthSwitcher = ({ month, onChange, allowFuture = false, className = "" }) => (
  <div className={`inline-flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80 ${className}`}>
    <button type="button" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month" className={arrow}>
      <LuChevronLeft className="size-4" aria-hidden="true" />
    </button>
    <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-slate-900 sm:min-w-36">
      {/* "Nov 2026" on phones, "November 2026" from sm */}
      <span className="sm:hidden">{new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
      <span className="hidden sm:inline">{monthLabel(month)}</span>
    </span>
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
