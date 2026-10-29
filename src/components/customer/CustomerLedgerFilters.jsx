import { LEDGER_TYPE_LABELS } from "../../constants/customer";
import { todayInputValue } from "../../utils/formatDate";

const FIELD_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Date range and entry type; the backend does the filtering
const CustomerLedgerFilters = ({ filters, onFilter, onReset }) => {
  const hasFilters = Boolean(filters.from || filters.to || filters.type);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        From
        <input
          type="date"
          value={filters.from}
          max={filters.to || todayInputValue()}
          onChange={(e) => onFilter("from", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        To
        <input
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          max={todayInputValue()}
          onChange={(e) => onFilter("to", e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        Type
        <select value={filters.type} onChange={(e) => onFilter("type", e.target.value)} className={FIELD_CLASS}>
          <option value="">All types</option>
          {Object.entries(LEDGER_TYPE_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {hasFilters && (
        <button type="button" onClick={onReset} className="rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
          Clear filters
        </button>
      )}
    </div>
  );
};

export default CustomerLedgerFilters;
