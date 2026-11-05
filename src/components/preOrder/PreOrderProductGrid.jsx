import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePreOrderProducts } from "../../hooks/usePreOrderApi";
import { formatTaka } from "../../utils/money";
import Badge from "../common/data/Badge";
import Pagination from "../common/data/Pagination";
import Select from "../common/forms/Select";
import Spinner from "../common/loaders/Spinner";

// Products this branch has none of, as cards. Clicking adds one to the cart. isAdded(product) marks the ones already in it.
const PreOrderProductGrid = ({ onAdd, isAdded }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState({ category: "", brand: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const { data, isLoading } = usePreOrderProducts({ search, ...filters, page, limit });
  const { data: categories = [] } = useCategoryOptionsData();
  const { data: brands = [] } = useBrandOptionsData();
  const rows = data?.data ?? [];

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <section className="min-w-0 space-y-3">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search product by name"
            aria-label="Search product"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-xs outline-none placeholder:text-slate-500 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <Select
          variant="filter"
          aria-label="Filter by category"
          placeholder="All categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Filter by brand"
          placeholder="All brands"
          options={brands.map((b) => ({ value: b._id, label: b.name }))}
          value={filters.brand}
          onChange={(e) => setFilter("brand", e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-brand" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-white px-5 py-16 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">
          {search
            ? `No out-of-stock product matches "${search}". If it's in stock, sell it from the POS.`
            : "Every product is in stock right now. Sell from the POS."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {rows.map((product) => {
            const added = isAdded(product);
            return (
              <button
                key={product._id}
                type="button"
                onClick={() => onAdd(product)}
                className={`relative flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 transition hover:shadow-md ${added ? "ring-2 ring-slate-400" : "ring-slate-200/80 hover:ring-slate-300"}`}
              >
                <span className="absolute right-2 top-2 z-10">{added ? <Badge tone="blue">Added</Badge> : <Badge tone="amber">No stock</Badge>}</span>
                <span className="flex aspect-[4/3] items-center justify-center bg-slate-50">
                  {product.image?.url ? (
                    <img src={product.image.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-slate-400">No Image</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="line-clamp-2 text-sm font-semibold uppercase text-slate-800 [overflow-wrap:anywhere]">{product.name}</span>
                  <span className="text-xs text-slate-500">
                    Available: <span className="font-semibold text-slate-700">0</span>
                    {product.trackSerial && " · IMEI"}
                  </span>
                  <span className={`mt-auto text-sm font-bold ${product.salePrice ? "text-teal-600" : "font-medium text-slate-400"}`}>
                    {product.salePrice ? formatTaka(product.salePrice) : "No price yet"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Pagination
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />
    </section>
  );
};

export default PreOrderProductGrid;
