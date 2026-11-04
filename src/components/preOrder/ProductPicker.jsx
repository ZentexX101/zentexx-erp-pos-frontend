import { useCallback, useRef, useState } from "react";
import { LuChevronDown, LuX } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDismiss } from "../../hooks/useDismiss";
import { useProductsData } from "../../hooks/useProductApi";
import Spinner from "../common/loaders/Spinner";

// Searchable list of every active product, in stock or not (searched on the backend)
const ProductPicker = ({ value, onChange }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data, isFetching } = useProductsData({ search, status: "active", page: 1, limit: 20 });
  const products = data?.data ?? [];

  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const pick = (product) => {
    onChange(product);
    setSearchInput("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <p className="mb-1 text-sm font-medium text-slate-700">
        Product<span className="text-red-500"> *</span>
      </p>
      {value && !open ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2">
          <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 truncate text-left font-medium text-slate-900">
            {value.name}
          </button>
          <button type="button" onClick={() => onChange(null)} className="rounded p-1 text-slate-400 hover:text-slate-700" aria-label="Clear product">
            <LuX className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            autoFocus={open}
            aria-label="Search product"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search product by name"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
          />
          <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        </div>
      )}
      {open && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {isFetching && !products.length ? (
            <li className="flex justify-center py-4">
              <Spinner className="size-4 text-brand" />
            </li>
          ) : products.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500">No product found. Add it on the Products page first.</li>
          ) : (
            products.map((product) => (
              <li key={product._id}>
                <button
                  type="button"
                  onClick={() => pick(product)}
                  className="block w-full truncate px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  {product.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default ProductPicker;
