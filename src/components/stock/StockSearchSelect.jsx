import { useCallback, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useDismiss } from "../../hooks/useDismiss";
import Badge from "../common/data/Badge";
import Spinner from "../common/loaders/Spinner";

// The look of an in-stock product picker; the caller loads the rows for searchInput.
// onPick(stock row) — the box clears after each pick.
const StockSearchSelect = ({ label, placeholder = "Search product in stock...", searchInput, onSearchInput, rows, loading, onPick }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      {label && <p className="mb-1 text-sm font-medium text-slate-700">{label}</p>}
      <div className="relative">
        <input
          value={searchInput}
          onChange={(e) => {
            onSearchInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-9 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
        />
        <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {loading && !rows.length ? (
            <li className="flex justify-center py-4">
              <Spinner className="h-4 w-4 text-indigo-600" />
            </li>
          ) : rows.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500">Nothing in stock matches.</li>
          ) : (
            rows.map((stock) => (
              <li key={stock._id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(stock);
                    onSearchInput("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-900">{stock.product.name}</span>
                  {stock.product.trackSerial && <Badge tone="purple">IMEI</Badge>}
                  <span className="text-xs text-slate-500">In stock: {stock.quantity}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default StockSearchSelect;
