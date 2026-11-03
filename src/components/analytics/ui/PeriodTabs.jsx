import { todayInputValue } from "../../../utils/formatDate";
import { PERIOD_OPTIONS } from "../../../utils/period";

const DATE_CLASS =
  "h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-brand/10";

// The period as a segmented control (quicker than a dropdown); "Custom range" shows two dates.
// value: { period, from, to }; onChange(next value)
const PeriodTabs = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Period">
      {PERIOD_OPTIONS.map((option) => {
        const active = value.period === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange({ ...value, period: option.value })}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
    {value.period === "custom" && (
      <div className="flex items-center gap-2">
        <input
          type="date"
          aria-label="From date"
          value={value.from}
          max={value.to || todayInputValue()}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className={DATE_CLASS}
        />
        <span className="text-sm text-slate-400">to</span>
        <input
          type="date"
          aria-label="To date"
          value={value.to}
          min={value.from || undefined}
          max={todayInputValue()}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className={DATE_CLASS}
        />
      </div>
    )}
  </div>
);

export default PeriodTabs;
