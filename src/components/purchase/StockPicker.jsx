import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useStockOptionsData } from "../../hooks/useStockApi";
import Badge from "../common/data/Badge";
import SearchInput from "../common/forms/SearchInput";
import Spinner from "../common/loaders/Spinner";
import PickerCard from "./PickerCard";
import ProductThumb from "./ProductThumb";

// Products this branch has in stock (searched on the backend, max 20). Clicking adds one to the return.
const StockPicker = ({ addedIds, onAdd }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data: rows = [], isLoading } = useStockOptionsData(search);

  return (
    <PickerCard eyebrow="Product Selection" title="Select Products">
      <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search product by name" />

      <div className="mt-3 max-h-80 flex-1 overflow-y-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-5 w-5 text-indigo-600" />
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {search ? `No product in stock matches "${search}".` : "Nothing in this branch's stock yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((stock) => {
              const added = addedIds.has(stock.product._id);
              return (
                <li key={stock._id}>
                  <button
                    type="button"
                    onClick={() => onAdd(stock)}
                    disabled={added}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50 disabled:cursor-default disabled:bg-green-50/60"
                  >
                    <ProductThumb product={stock.product} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{stock.product.name}</span>
                      <span className="text-xs text-slate-500">In stock: {stock.quantity}</span>
                    </span>
                    {stock.product.trackSerial && <Badge tone="purple">IMEI</Badge>}
                    {added ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <LuCheck className="h-4 w-4" aria-hidden="true" />
                        Added
                      </span>
                    ) : (
                      <span className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-700">Add</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">Showing up to 20 matches. Type to narrow down.</p>
    </PickerCard>
  );
};

export default StockPicker;
