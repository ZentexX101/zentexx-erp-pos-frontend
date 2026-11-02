import { LuTrash2 } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";
import { expenseLineCost } from "../../utils/expense";
import { toIntegerInput } from "../../utils/number";
import Spinner from "../common/loaders/Spinner";
import StockSelect from "../stock/StockSelect";

// Tick the IMEIs leaving stock; each shows what it cost
const SerialChecklist = ({ productId, selected, onChange }) => {
  const { data: units = [], isLoading } = useStockSerialsData(productId);
  const picked = new Set(selected.map((unit) => unit.serial));
  if (isLoading) return <Spinner className="h-4 w-4 text-indigo-600" />;
  return (
    <div className="max-h-36 space-y-1 overflow-y-auto">
      {units.map((unit) => (
        <label key={unit._id} className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={picked.has(unit.serial)}
            onChange={() =>
              onChange(picked.has(unit.serial) ? selected.filter((u) => u.serial !== unit.serial) : [...selected, { serial: unit.serial, cost: unit.purchasePrice }])
            }
            className="rounded border-slate-300"
          />
          <span className="font-mono">{unit.serial}</span>
          <span className="text-slate-400">{formatTaka(unit.purchasePrice)}</span>
        </label>
      ))}
    </div>
  );
};

// Products used up by a product expense. lines: [{ stock, quantity, units }]; onChange(next).
// The value shown is the stock cost; the backend books the exact cost.
const ExpenseProductItems = ({ lines, onChange }) => {
  const add = (stock) => {
    if (lines.some((line) => line.stock.product._id === stock.product._id)) return;
    onChange([...lines, { stock, quantity: "1", units: [] }]);
  };
  const set = (index, patch) => onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  return (
    <div className="space-y-3">
      <StockSelect label="Product *" onPick={add} />

      {lines.map((line, index) => {
        const { product } = line.stock;
        const cost = expenseLineCost(line);
        return (
          <div key={product._id} className="flex flex-wrap items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-48 flex-1">
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">In stock: {line.stock.quantity}</p>
            </div>
            <div className="w-56">
              {product.trackSerial ? (
                <SerialChecklist productId={product._id} selected={line.units} onChange={(units) => set(index, { units })} />
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
            <div className="text-right">
              <p className="text-xs text-slate-500">Cost</p>
              <p className="font-semibold text-red-600">{formatTaka(cost)}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(lines.filter((_, i) => i !== index))}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
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

export default ExpenseProductItems;
