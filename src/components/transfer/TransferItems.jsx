import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useTransferSerialsData, useTransferStockData } from "../../hooks/useTransferApi";
import { toIntegerInput } from "../../utils/number";
import Badge from "../common/data/Badge";
import Spinner from "../common/loaders/Spinner";
import StockSearchSelect from "../stock/StockSearchSelect";

// Tick the IMEIs to send from the sending branch
const SerialChecklist = ({ branch, productId, selected, onChange }) => {
  const { data: units = [], isLoading } = useTransferSerialsData(branch, productId);
  if (isLoading) return <Spinner className="h-4 w-4 text-indigo-600" />;
  return (
    <div className="max-h-36 space-y-1 overflow-y-auto">
      {units.map((unit) => (
        <label key={unit._id} className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={selected.includes(unit.serial)}
            onChange={() => onChange(selected.includes(unit.serial) ? selected.filter((s) => s !== unit.serial) : [...selected, unit.serial])}
            className="rounded border-slate-300"
          />
          <span className="font-mono">{unit.serial}</span>
        </label>
      ))}
    </div>
  );
};

// The products being sent. lines: [{ stock, quantity, serials }]; onChange(next).
// Products and IMEIs come from the sending branch's stock.
const TransferItems = ({ fromBranch, lines, onChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data: rows = [], isFetching } = useTransferStockData(fromBranch, search);

  const add = (stock) => {
    if (lines.some((line) => line.stock.product._id === stock.product._id)) return;
    onChange([...lines, { stock, quantity: "1", serials: [] }]);
  };
  const set = (index, patch) => onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  return (
    <div className="space-y-3">
      <StockSearchSelect
        label="Products to send *"
        placeholder="Search product in the sending branch..."
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        rows={rows}
        loading={isFetching}
        onPick={add}
      />

      {lines.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No products added yet.</p>}

      {lines.map((line, index) => {
        const { product } = line.stock;
        return (
          <div key={product._id} className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_14rem_auto]">
            <div className="min-w-0">
              <p className="break-words font-medium uppercase text-slate-900">{product.name}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                In stock: {line.stock.quantity}
                {product.trackSerial && <Badge tone="purple">IMEI · {line.serials.length} picked</Badge>}
              </p>
            </div>
            <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              {product.trackSerial ? (
                <SerialChecklist branch={fromBranch} productId={product._id} selected={line.serials} onChange={(serials) => set(index, { serials })} />
              ) : (
                <label className="block text-xs font-semibold text-slate-700">
                  Quantity
                  <input
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(e) => set(index, { quantity: toIntegerInput(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal outline-none focus:ring-2 focus:ring-brand/10"
                  />
                </label>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange(lines.filter((_, i) => i !== index))}
              className="col-start-2 row-start-1 rounded-md p-1.5 text-slate-400 sm:col-start-3 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${product.name}`}
            >
              <LuTrash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default TransferItems;
