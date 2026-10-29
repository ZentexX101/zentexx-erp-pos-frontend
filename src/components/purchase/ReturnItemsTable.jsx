import { LuTrash2 } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { returnLineQuantity, returnLineTotal } from "../../utils/purchase";
import Badge from "../common/data/Badge";
import Spinner from "../common/loaders/Spinner";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// Tick the IMEIs to send back; only pieces bought from the selected supplier are listed
const SerialChecklist = ({ productId, supplierId, selected, onChange }) => {
  const { data: units = [], isLoading } = useStockSerialsData(productId, supplierId);
  const picked = new Set(selected.map((unit) => unit.serial));

  if (isLoading) return <Spinner className="h-4 w-4 text-indigo-600" />;
  if (!units.length) return <p className="text-xs text-amber-600">No IMEI of this product bought from this supplier is in stock.</p>;

  const toggle = (unit) =>
    onChange(picked.has(unit.serial) ? selected.filter((u) => u.serial !== unit.serial) : [...selected, { serial: unit.serial, purchasePrice: unit.purchasePrice }]);

  return (
    <div className="max-h-40 space-y-1 overflow-y-auto">
      {units.map((unit) => (
        <label key={unit._id} className="flex cursor-pointer items-center gap-2 text-xs">
          <input type="checkbox" checked={picked.has(unit.serial)} onChange={() => toggle(unit)} className="rounded border-slate-300" />
          <span className="font-mono text-slate-800">{unit.serial}</span>
          <span className="text-slate-400">{formatTaka(unit.purchasePrice)}</span>
        </label>
      ))}
    </div>
  );
};

// The products being returned. onChange(index, field, value), onRemove(index).
const ReturnItemsTable = ({ lines, supplierId, onChange, onRemove }) => (
  <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Return Items</p>
      <h2 className="text-lg font-semibold text-slate-900">Quantity & Price</h2>
    </div>

    {lines.length === 0 ? (
      <p className="px-5 py-10 text-center text-sm text-slate-500">Pick products above to add them here.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2.5 font-semibold">#</th>
              <th className="px-4 py-2.5 font-semibold">Product</th>
              <th className="w-72 px-4 py-2.5 font-semibold">Qty / IMEI</th>
              <th className="w-36 px-4 py-2.5 font-semibold">Return Price</th>
              <th className="px-4 py-2.5 text-right font-semibold">Total</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line, index) => {
              const { product } = line.stock;
              return (
                <tr key={product._id} className="align-top">
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">In stock: {line.stock.quantity}</p>
                    {product.trackSerial && <Badge tone="purple">IMEI · {returnLineQuantity(line)} picked</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {product.trackSerial ? (
                      supplierId ? (
                        <SerialChecklist
                          productId={product._id}
                          supplierId={supplierId}
                          selected={line.units}
                          onChange={(units) => onChange(index, "units", units)}
                        />
                      ) : (
                        <p className="text-xs text-slate-500">Select the supplier first.</p>
                      )
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
                  <td className="px-4 py-3">
                    {product.trackSerial ? (
                      <p className="text-xs text-slate-500">Each IMEI at its purchase price</p>
                    ) : (
                      <input
                        inputMode="decimal"
                        aria-label={`Return price of ${product.name}`}
                        value={line.unitCost}
                        onChange={(e) => onChange(index, "unitCost", toDecimalInput(e.target.value))}
                        className={inputClass}
                      />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{formatTaka(returnLineTotal(line))}</td>
                  <td className="px-4 py-3 text-right">
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
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

export default ReturnItemsTable;
