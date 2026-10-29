import { todayInputValue } from "../../utils/formatDate";
import SearchInput from "../common/forms/SearchInput";

const FIELD_CLASS =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-brand/10";

// Search (number or supplier) and a date range for the purchase / return lists; filtered on the backend
const PurchaseListFilters = ({ searchInput, onSearch, filters, onFilter, searchPlaceholder }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
    <SearchInput value={searchInput} onChange={onSearch} placeholder={searchPlaceholder} className="sm:w-80" />
    <div className="flex items-center gap-2">
      <input
        type="date"
        aria-label="From date"
        value={filters.from}
        max={filters.to || todayInputValue()}
        onChange={(e) => onFilter("from", e.target.value)}
        className={FIELD_CLASS}
      />
      <span className="text-sm text-slate-500">to</span>
      <input
        type="date"
        aria-label="To date"
        value={filters.to}
        min={filters.from || undefined}
        max={todayInputValue()}
        onChange={(e) => onFilter("to", e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  </div>
);

export default PurchaseListFilters;
