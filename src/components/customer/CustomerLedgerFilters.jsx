import { LEDGER_TYPE_LABELS } from "../../constants/customer";
import DateRangeFilter from "../common/forms/DateRangeFilter";
import FilterBar from "../common/forms/FilterBar";
import Select from "../common/forms/Select";

const TYPE_OPTIONS = Object.entries(LEDGER_TYPE_LABELS).map(([value, { label }]) => ({ value, label }));

// Date range and entry type; the backend does the filtering
const CustomerLedgerFilters = ({ filters, onFilter, onReset }) => {
  const hasFilters = Boolean(filters.from || filters.to || filters.type);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <FilterBar onClear={hasFilters ? onReset : undefined}>
        <DateRangeFilter
          value={filters}
          onChange={({ from, to }) => {
            onFilter("from", from);
            onFilter("to", to);
          }}
          className="col-span-2 sm:w-80"
        />
        <Select
          variant="filter"
          label="Type"
          value={filters.type}
          onChange={(e) => onFilter("type", e.target.value)}
          placeholder="All types"
          options={TYPE_OPTIONS}
          className="col-span-2 sm:col-span-1"
        />
      </FilterBar>
    </div>
  );
};

export default CustomerLedgerFilters;
