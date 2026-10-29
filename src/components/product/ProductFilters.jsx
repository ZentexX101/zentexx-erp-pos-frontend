import { PRODUCT_STATUS } from "../../constants/product";
import FilterBar from "../common/forms/FilterBar";
import SearchInput from "../common/forms/SearchInput";
import Select from "../common/forms/Select";

const STATUS_OPTIONS = [
  { value: PRODUCT_STATUS.ACTIVE, label: "Active" },
  { value: PRODUCT_STATUS.INACTIVE, label: "Inactive" },
];

// Search box and category / brand / status filters; the backend does the filtering
const ProductFilters = ({ searchInput, onSearch, filters, onFilter, onClear, categories, brands }) => (
  <FilterBar
    className="pt-2"
    search={<SearchInput value={searchInput} onChange={onSearch} placeholder="Search product..." />}
    onClear={Object.values(filters).some(Boolean) ? onClear : undefined}
  >
    <Select
      variant="filter"
      value={filters.category}
      onChange={(e) => onFilter("category", e.target.value)}
      aria-label="Filter by category"
      placeholder="All categories"
      options={categories.map((c) => ({ value: c._id, label: c.name }))}
    />
    <Select
      variant="filter"
      value={filters.brand}
      onChange={(e) => onFilter("brand", e.target.value)}
      aria-label="Filter by brand"
      placeholder="All brands"
      options={brands.map((b) => ({ value: b._id, label: b.name }))}
    />
    <Select
      variant="filter"
      value={filters.status}
      onChange={(e) => onFilter("status", e.target.value)}
      aria-label="Filter by status"
      placeholder="All statuses"
      options={STATUS_OPTIONS}
    />
  </FilterBar>
);

export default ProductFilters;
