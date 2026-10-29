import { todayInputValue } from "../../../utils/formatDate";
import { PERIOD_OPTIONS } from "../../../utils/period";
import Select from "./Select";

const DATE_CLASS =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-brand/10";

// "Today / Yesterday / ... / Custom range" select; custom shows two date inputs.
// value: { period, from, to }; onChange(next value). Turn it into dates with utils/period periodRange.
const PeriodFilter = ({ value, onChange }) => (
  <>
    <Select
      variant="filter"
      aria-label="Period"
      options={PERIOD_OPTIONS}
      value={value.period}
      onChange={(e) => onChange({ ...value, period: e.target.value })}
    />
    {value.period === "custom" && (
      <div className="col-span-2 flex items-center gap-2">
        <input
          type="date"
          aria-label="From date"
          value={value.from}
          max={value.to || todayInputValue()}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className={DATE_CLASS}
        />
        <span className="text-sm text-slate-500">to</span>
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
  </>
);

export default PeriodFilter;
