import { useState } from "react";
import { LuScanLine } from "react-icons/lu";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePosProductsData } from "../../hooks/useSaleApi";
import { formatTaka } from "../../utils/money";
import Badge from "../common/data/Badge";
import Pagination from "../common/data/Pagination";
import Select from "../common/forms/Select";
import Spinner from "../common/loaders/Spinner";

// The branch's products as cards (in-stock first). Clicking adds one to the cart. Typing or scanning
// an IMEI and pressing Enter adds that exact piece (onScan). inCart(stock) marks the cards already added.
const PosProductGrid = ({ onAdd, onScan, inCart }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState({ category: "", brand: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [scanning, setScanning] = useState(false);

  const { data, isLoading } = usePosProductsData({ search, ...filters, page, limit });
  const { data: categories = [] } = useCategoryOptionsData();
  const { data: brands = [] } = useBrandOptionsData();
  const rows = data?.data ?? [];

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Enter = treat the text as a scanned IMEI
  const handleKeyDown = async (e) => {
    const value = searchInput.trim();
    if (e.key !== "Enter" || !value) return;
    e.preventDefault();
    setScanning(true);
    const added = await onScan(value);
    setScanning(false);
    if (added) setSearchInput("");
  };

  return (
    <section className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <LuScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search product, or scan IMEI + Enter"
            aria-label="Search product or scan IMEI"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-xs outline-none placeholder:text-slate-500 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-brand/10"
          />
          {scanning && <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />}
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
          <Spinner className="h-6 w-6 text-indigo-600" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          {search ? `No product matches "${search}".` : "No products in this branch yet. Use Sync Products on the Stock page."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {rows.map((stock) => {
            const out = stock.quantity === 0;
            const added = inCart(stock);
            return (
              <button
                key={stock._id}
                type="button"
                onClick={() => onAdd(stock)}
                disabled={out}
                className={`group relative flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 transition ${
                  added ? "ring-2 ring-indigo-500" : "ring-slate-200 hover:ring-indigo-300"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                <span className="absolute right-2 top-2 z-10">
                  {out ? <Badge tone="red">Out of stock</Badge> : added ? <Badge tone="blue">In cart</Badge> : null}
                </span>
                <span className="flex aspect-[4/3] items-center justify-center bg-slate-50">
                  {stock.product.image?.url ? (
                    <img src={stock.product.image.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm text-slate-400">No Image</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="line-clamp-2 text-sm font-semibold uppercase text-slate-800">{stock.product.name}</span>
                  <span className="text-xs text-slate-500">
                    Available: <span className="font-semibold text-slate-700">{stock.quantity}</span>
                    {stock.product.trackSerial && " · IMEI"}
                  </span>
                  <span className="mt-auto font-bold text-teal-600">{formatTaka(stock.salePrice)}</span>
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

export default PosProductGrid;
