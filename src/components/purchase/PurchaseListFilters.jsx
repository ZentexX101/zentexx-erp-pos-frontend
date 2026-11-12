import { LuX } from "react-icons/lu";
import { periodRange } from "../../utils/period";
import DateRangeFilter from "../common/forms/DateRangeFilter";
import SearchInput from "../common/forms/SearchInput";

// Search (number or supplier), a period and a one-click "Today" for the purchase / return lists; filtered on the backend
const PurchaseListFilters = ({ searchInput, onSearch, filters, onFilter, searchPlaceholder }) => {
  const setRange = ({ from, to }) => {
    onFilter("from", from);
    onFilter("to", to);
  };
  const today = periodRange("today");
  const isToday = filters.from === today.from && filters.to === today.to;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput value={searchInput} onChange={onSearch} placeholder={searchPlaceholder} className="sm:w-80" />
      <div className="flex gap-2">
        <DateRangeFilter value={filters} onChange={setRange} className="flex-1 sm:w-80 sm:flex-none" />
        <button
          type="button"
          onClick={() => setRange(today)}
          aria-pressed={isToday}
          className={`h-10 shrink-0 rounded-lg border px-4 text-sm font-medium shadow-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${
            isToday ? "border-brand bg-brand text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Today
        </button>
        {(filters.from || filters.to) && (
          <button
            type="button"
            onClick={() => setRange({ from: "", to: "" })}
            aria-label="Clear date filter"
            title="Clear date filter"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
          >
            <LuX className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PurchaseListFilters;
