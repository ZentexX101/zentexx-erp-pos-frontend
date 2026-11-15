import { UNIT_STATUS_INFO } from "../../constants/product";
import FilterBar from "../common/forms/FilterBar";
import SearchInput from "../common/forms/SearchInput";
import Select from "../common/forms/Select";

// "transferred" isn't set on pieces any more (a transfer just changes the piece's branch)
const STATUS_OPTIONS = Object.entries(UNIT_STATUS_INFO)
  .filter(([value]) => value !== "transferred")
  .map(([value, info]) => ({ value, label: info.label }));

// IMEI search plus status / branch; the backend does the filtering
const ProductUnitFilters = ({ searchInput, onSearch, filters, onFilter, onClear, branches }) => (
  <FilterBar
    search={<SearchInput value={searchInput} onChange={onSearch} placeholder="Search IMEI / serial..." />}
    onClear={searchInput || filters.status || filters.branch ? onClear : undefined}
  >
    <Select
      variant="filter"
      value={filters.status}
      onChange={(e) => onFilter("status", e.target.value)}
      aria-label="Filter by status"
      placeholder="All statuses"
      options={STATUS_OPTIONS}
    />
    <Select
      variant="filter"
      value={filters.branch}
      onChange={(e) => onFilter("branch", e.target.value)}
      aria-label="Filter by branch"
      placeholder="All branches"
      options={branches.map((b) => ({ value: b._id, label: b.name }))}
    />
  </FilterBar>
);

export default ProductUnitFilters;
