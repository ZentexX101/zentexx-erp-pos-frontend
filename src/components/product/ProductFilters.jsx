import { PRODUCT_STATUS } from "../../constants/product";
import SearchInput from "../common/forms/SearchInput";

const FILTER_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Search box and category / brand / status filters; the backend does the filtering
const ProductFilters = ({ searchInput, onSearch, filters, onFilter, categories, brands }) => (
  <div className="flex flex-col gap-3 pt-2 lg:flex-row">
    <SearchInput value={searchInput} onChange={onSearch} placeholder="Search product..." className="lg:w-80" />

    <select
      value={filters.category}
      onChange={(e) => onFilter("category", e.target.value)}
      aria-label="Filter by category"
      className={FILTER_CLASS}
    >
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>

    <select value={filters.brand} onChange={(e) => onFilter("brand", e.target.value)} aria-label="Filter by brand" className={FILTER_CLASS}>
      <option value="">All brands</option>
      {brands.map((b) => (
        <option key={b._id} value={b._id}>
          {b.name}
        </option>
      ))}
    </select>

    <select value={filters.status} onChange={(e) => onFilter("status", e.target.value)} aria-label="Filter by status" className={FILTER_CLASS}>
      <option value="">All statuses</option>
      <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
      <option value={PRODUCT_STATUS.INACTIVE}>Inactive</option>
    </select>
  </div>
);

export default ProductFilters;
