import { LuPlus, LuSmartphone, LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { newTradeIn, tradeInQuantity } from "../../utils/exchange";
import ProductSelect from "../product/ProductSelect";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-0.5 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

// "Old Device Details": the customer's devices taken in. Each goes into stock at its exchange value.
// lines: see utils/exchange newTradeIn; onChange(next)
const TradeInPanel = ({ lines, onChange }) => {
  const setLine = (key, patch) => onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <LuSmartphone className="h-4 w-4" aria-hidden="true" />
          Old Device Details <span className="text-xs font-normal text-indigo-500">(পুরাতন ডিভাইস)</span>
        </h2>
        <button
          type="button"
          onClick={() => onChange([...lines, newTradeIn()])}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add another device
        </button>
      </div>

      {lines.map((line, index) => (
        <div key={line.key} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <ProductSelect
                label={`Device ${index + 1} — product`}
                placeholder="Search product to buy back..."
                value={line.product}
                onChange={(product) => setLine(line.key, { product, serial: "", quantity: "1" })}
              />
            </div>
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(lines.filter((l) => l.key !== line.key))}
                className="mt-6 rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove device ${index + 1}`}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {line.product && (
            <div className="grid gap-3 sm:grid-cols-3">
              {line.product.trackSerial ? (
                <Field label="Device IMEI *" hint="Must not be in stock already">
                  <input
                    value={line.serial}
                    onChange={(e) => setLine(line.key, { serial: e.target.value })}
                    placeholder="Scan or type IMEI"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              ) : (
                <Field label="Quantity *">
                  <input
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(e) => setLine(line.key, { quantity: toIntegerInput(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
              )}
              <Field label="Buyback / Exchange Value (৳) *" hint="Its cost in your stock">
                <input
                  inputMode="decimal"
                  value={line.value}
                  onChange={(e) => setLine(line.key, { value: toDecimalInput(e.target.value) })}
                  placeholder="Amount in BDT"
                  className={`${inputClass} border-green-300 bg-green-50`}
                />
              </Field>
              <Field label="Resale Price (৳)" hint="Optional: its selling price in stock">
                <input
                  inputMode="decimal"
                  value={line.salePrice}
                  onChange={(e) => setLine(line.key, { salePrice: toDecimalInput(e.target.value) })}
                  placeholder="Keep current"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          {line.product && tradeInQuantity(line) > 0 && Number(line.value) > 0 && (
            <p className="text-xs text-slate-600">
              Goes into stock: {tradeInQuantity(line)} × {line.product.name} at {formatTaka(Number(line.value))} each.
            </p>
          )}
        </div>
      ))}
    </section>
  );
};

export default TradeInPanel;
