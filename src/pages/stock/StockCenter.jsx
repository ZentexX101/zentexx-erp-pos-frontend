import { useState } from "react";
import { LuBoxes, LuCoins, LuPackage, LuPackageX, LuTag, LuTriangleAlert } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import FilterBar from "../../components/common/forms/FilterBar";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import PageHeader from "../../components/common/layout/PageHeader";
import BranchStockCards from "../../components/stockCenter/BranchStockCards";
import StockCenterTable from "../../components/stockCenter/StockCenterTable";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useStockCenterData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";

const QUANTITY_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock (1–5)" },
  { value: "out_of_stock", label: "Out of stock" },
];

const NO_FILTERS = { branch: "", category: "", brand: "", quantity: "" };

// One figure of the summary row
const Tile = ({ icon, label, value, tone = "text-slate-900" }) => {
  const Icon = icon;
  return (
    <div className="min-w-0 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </p>
      <p className={`mt-1 truncate text-lg font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
};

// Stock Center (main admin): how much of every product each branch holds, side by side.
// The branch cards always show every branch; a picked branch (card or filter) narrows the table to it.
const StockCenter = () => {
  // all states
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // call stock center api (filters, search and paging run on the backend)
  const { data, isLoading, error } = useStockCenterData({ search, ...filters, page, limit });
  // every branch's totals for the cards, whatever is filtered below
  const { data: overview } = useStockCenterData({ page: 1, limit: 1 });
  const { data: categories = [] } = useCategoryOptionsData();
  const { data: brands = [] } = useBrandOptionsData();

  const allBranches = overview?.meta?.branches ?? [];
  const columns = data?.meta?.branches ?? [];
  const summary = data?.meta?.summary;
  const rows = (data?.data ?? []).map((row, index) => ({ ...row, key: row.product?._id ?? `row-${index}` }));

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Stock Center" subtitle="How much of every product each branch has, side by side" />

      <BranchStockCards branches={allBranches} active={filters.branch} onPick={(id) => handleFilter("branch", id)} showValue />

      <FilterBar
        search={
          <SearchInput
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              setPage(1);
            }}
            placeholder="Search product..."
          />
        }
        onClear={
          searchInput || Object.values(filters).some(Boolean)
            ? () => {
                setSearchInput("");
                setFilters(NO_FILTERS);
                setPage(1);
              }
            : undefined
        }
      >
        <Select
          variant="filter"
          aria-label="Branch"
          placeholder="All branches"
          options={allBranches.map((b) => ({ value: b._id, label: b.name }))}
          value={filters.branch}
          onChange={(e) => handleFilter("branch", e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Category"
          placeholder="All categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          value={filters.category}
          onChange={(e) => handleFilter("category", e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Brand"
          placeholder="All brands"
          options={brands.map((b) => ({ value: b._id, label: b.name }))}
          value={filters.brand}
          onChange={(e) => handleFilter("brand", e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Stock status"
          placeholder="Any stock"
          options={QUANTITY_OPTIONS}
          value={filters.quantity}
          onChange={(e) => handleFilter("quantity", e.target.value)}
        />
      </FilterBar>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Tile icon={LuPackage} label="Products" value={(summary?.products ?? 0).toLocaleString("en-IN")} />
        <Tile icon={LuBoxes} label="Pieces" value={(summary?.quantity ?? 0).toLocaleString("en-IN")} />
        <Tile icon={LuCoins} label="Cost value" value={formatTaka(summary?.value ?? 0)} />
        <Tile icon={LuTag} label="Selling value" value={formatTaka(summary?.saleValue ?? 0)} tone="text-green-600" />
        <Tile icon={LuTriangleAlert} label="Low stock" value={summary?.lowStock ?? 0} tone="text-amber-600" />
        <Tile icon={LuPackageX} label="Out of stock" value={summary?.outOfStock ?? 0} tone="text-red-600" />
      </div>

      <Alert>{error?.message}</Alert>

      <StockCenterTable
        rows={rows}
        branches={columns}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search) || Object.values(filters).some(Boolean)}
        showValue
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />
    </div>
  );
};

export default StockCenter;
