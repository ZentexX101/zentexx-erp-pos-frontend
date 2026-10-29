import { useCallback, useRef, useState } from "react";
import { LuChevronDown, LuX } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDismiss } from "../../hooks/useDismiss";
import { useSupplierOptionsData } from "../../hooks/useSupplierApi";
import { formatPhone } from "../../utils/phone";
import Spinner from "../common/loaders/Spinner";
import SupplierBalance from "./SupplierBalance";

// Searchable supplier dropdown for forms: type a name or phone, pick one (searched on the backend)
const SupplierSelect = ({ label = "Supplier", value, onChange, error }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data: suppliers = [], isFetching } = useSupplierOptionsData(search);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const pick = (supplier) => {
    onChange(supplier);
    setSearchInput("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <p className="mb-1 text-sm font-medium text-slate-700">
        {label}
        <span className="text-red-500"> *</span>
      </p>

      {value && !open ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2">
          <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
            <span className="block truncate font-medium text-slate-900">{value.name}</span>
            <span className="text-xs text-slate-500">{formatPhone(value.phone)}</span>
          </button>
          <button type="button" onClick={() => onChange(null)} className="rounded p-1 text-slate-400 hover:text-slate-700" aria-label="Clear supplier">
            <LuX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            autoFocus={open}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search supplier by name or phone"
            aria-invalid={Boolean(error)}
            className={`w-full rounded-md border bg-white px-3 py-2 pr-9 text-slate-900 outline-none focus:ring-2 ${
              error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-slate-400 focus:ring-brand/10"
            }`}
          />
          <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        </div>
      )}

      {open && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {isFetching && !suppliers.length ? (
            <li className="flex justify-center py-4">
              <Spinner className="h-4 w-4 text-indigo-600" />
            </li>
          ) : suppliers.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-slate-500">No supplier found.</li>
          ) : (
            suppliers.map((supplier) => (
              <li key={supplier._id}>
                <button
                  type="button"
                  onClick={() => pick(supplier)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">{supplier.name}</span>
                    <span className="text-xs text-slate-500">{formatPhone(supplier.phone)}</span>
                  </span>
                  <SupplierBalance amount={supplier.balance} signed className="text-xs" />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SupplierSelect;
