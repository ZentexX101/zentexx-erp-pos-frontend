import { useState } from "react";
import { LuTrash2, LuX } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { cartLineQuantity, cartLineTotal } from "../../utils/sale";
import Spinner from "../common/loaders/Spinner";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// Pick IMEIs from this branch's stock for one cart line
const SerialPicker = ({ productId, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const { data: units = [], isLoading } = useStockSerialsData(productId, undefined, { enabled: open });
  const picked = new Set(selected);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {selected.map((serial) => (
          <span key={serial} className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[11px] text-purple-700">
            {serial}
            <button type="button" onClick={() => onChange(selected.filter((s) => s !== serial))} aria-label={`Remove ${serial}`}>
              <LuX className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <button type="button" onClick={() => setOpen(!open)} className="text-xs font-semibold text-indigo-600 hover:underline">
        {open ? "Close IMEI list" : selected.length ? "Pick more IMEIs" : "Pick IMEI"}
      </button>
      {open &&
        (isLoading ? (
          <Spinner className="h-4 w-4 text-indigo-600" />
        ) : (
          <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-slate-200 p-2">
            {units.length === 0 && <p className="text-xs text-slate-500">No IMEI in stock.</p>}
            {units.map((unit) => (
              <label key={unit._id} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={picked.has(unit.serial)}
                  onChange={() => onChange(picked.has(unit.serial) ? selected.filter((s) => s !== unit.serial) : [...selected, unit.serial])}
                  className="rounded border-slate-300"
                />
                <span className="font-mono">{unit.serial}</span>
              </label>
            ))}
          </div>
        ))}
    </div>
  );
};

// The cart: quantity (or IMEIs), selling price and line total. onChange(index, field, value), onRemove(index).
const PosCart = ({ lines, onChange, onRemove }) => (
  <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Product</th>
            <th className="w-44 px-3 py-2.5 font-semibold">Qty / IMEIs</th>
            <th className="w-28 px-3 py-2.5 font-semibold">Price</th>
            <th className="px-3 py-2.5 text-right font-semibold">Total</th>
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                No products added yet.
                <span className="block text-xs">Click a product or scan an IMEI to begin the sale.</span>
              </td>
            </tr>
          ) : (
            lines.map((line, index) => {
              const { product } = line.stock;
              return (
                <tr key={product._id} className="align-top">
                  <td className="px-3 py-2.5">
                    <p className="font-medium uppercase text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">In stock: {line.stock.quantity}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    {product.trackSerial ? (
                      <SerialPicker productId={product._id} selected={line.serials} onChange={(serials) => onChange(index, "serials", serials)} />
                    ) : (
                      <input
                        inputMode="numeric"
                        aria-label={`Quantity of ${product.name}`}
                        value={line.quantity}
                        onChange={(e) => onChange(index, "quantity", toIntegerInput(e.target.value))}
                        className={inputClass}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      inputMode="decimal"
                      aria-label={`Selling price of ${product.name}`}
                      value={line.unitPrice}
                      onChange={(e) => onChange(index, "unitPrice", toDecimalInput(e.target.value))}
                      className={inputClass}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">
                    {formatTaka(cartLineTotal(line))}
                    <span className="block text-xs font-normal text-slate-500">× {cartLineQuantity(line)}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${product.name}`}
                    >
                      <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
);

export default PosCart;
