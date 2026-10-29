import { toDecimalInput } from "../../utils/number";
import FilterBar from "../common/forms/FilterBar";
import Input from "../common/forms/Input";
import SearchInput from "../common/forms/SearchInput";
import Select from "../common/forms/Select";

const QUANTITY_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock (1–5)" },
  { value: "out_of_stock", label: "Out of stock" },
];

// Search, category / brand / quantity, and "up to ৳" price limits; the backend does the filtering.
// The price inputs send their value once the user stops typing (debounced in the page).
const StockFilters = ({ searchInput, onSearch, filters, prices, onFilter, onPrice, onClear, categories, brands }) => (
  <FilterBar
    className="pt-2"
    search={<SearchInput value={searchInput} onChange={onSearch} placeholder="Search stock..." />}
    onClear={[...Object.values(filters), ...Object.values(prices)].some(Boolean) ? onClear : undefined}
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
      value={filters.quantity}
      onChange={(e) => onFilter("quantity", e.target.value)}
      aria-label="Filter by quantity"
      placeholder="Any quantity"
      options={QUANTITY_OPTIONS}
    />
    <Input
      variant="filter"
      inputMode="decimal"
      aria-label="Selling price up to"
      placeholder="Selling price up to ৳"
      value={prices.maxSalePrice}
      onChange={(e) => onPrice("maxSalePrice", toDecimalInput(e.target.value))}
    />
    <Input
      variant="filter"
      inputMode="decimal"
      aria-label="Buying price up to"
      placeholder="Buying price up to ৳"
      value={prices.maxPurchasePrice}
      onChange={(e) => onPrice("maxPurchasePrice", toDecimalInput(e.target.value))}
    />
  </FilterBar>
);

export default StockFilters;
