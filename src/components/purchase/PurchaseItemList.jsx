import { LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { lineQuantity, lineTotal } from "../../utils/purchase";
import { parseSerials, repeatedSerials } from "../../utils/serials";
import Badge from "../common/data/Badge";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

const Field = ({ label, required, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    {children}
  </label>
);

// IMEIs one per line (a barcode scanner adds the line break), with the count and any repeats
const SerialsInput = ({ value, onChange, name }) => {
  const serials = parseSerials(value);
  const repeated = repeatedSerials(serials);
  return (
    <div>
      <textarea
        rows={Math.min(Math.max(serials.length + 1, 3), 8)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`IMEI / serial numbers of ${name}`}
        placeholder="Scan or type one IMEI per line"
        className={`${inputClass} font-mono text-xs`}
      />
      {repeated.length > 0 && <p className="mt-0.5 text-xs text-red-600">Repeated: {repeated.join(", ")}</p>}
    </div>
  );
};

// One card per product added to the purchase, like the reference app.
// IMEI products take their serials (the quantity is the count); others take a quantity.
// onChange(index, field, value), onRemove(index).
const PurchaseItemList = ({ lines, onChange, onRemove }) => {
  if (!lines.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
        Pick products above to add them to this purchase.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const { product } = line;
        const set = (field) => (value) => onChange(index, field, value);
        return (
          <section key={product._id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold uppercase text-slate-900">{product.name}</h3>
                {product.trackSerial ? (
                  <Badge tone="purple">IMEI Product · {lineQuantity(line)} pcs</Badge>
                ) : (
                  <p className="text-xs font-medium text-indigo-600">Simple Product</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Line total</p>
                  <p className="font-bold text-slate-900">{formatTaka(lineTotal(line))}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${product.name}`}
                >
                  <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Product Selling Price">
                <input
                  inputMode="decimal"
                  placeholder="৳ per piece"
                  value={line.salePrice}
                  onChange={(e) => set("salePrice")(toDecimalInput(e.target.value))}
                  className={inputClass}
                />
                {Number(line.salePrice) > 0 && Number(line.salePrice) < Number(line.unitCost) && (
                  <span className="mt-0.5 block text-xs text-amber-600">Below the buying price</span>
                )}
              </Field>

              <Field label={product.trackSerial ? "Product Quantity (from IMEIs)" : "Product Quantity"} required={!product.trackSerial}>
                <input
                  inputMode="numeric"
                  value={product.trackSerial ? String(lineQuantity(line)) : line.quantity}
                  onChange={(e) => set("quantity")(toIntegerInput(e.target.value))}
                  readOnly={product.trackSerial}
                  className={`${inputClass} ${product.trackSerial ? "bg-slate-50 text-slate-500" : ""}`}
                />
              </Field>

              <Field label="Product Buying Price" required>
                <input
                  inputMode="decimal"
                  placeholder="Enter buying price"
                  value={line.unitCost}
                  onChange={(e) => set("unitCost")(toDecimalInput(e.target.value))}
                  className={inputClass}
                />
              </Field>

              {product.trackSerial && (
                <Field label="IMEI / Serial Numbers" required className="md:col-span-3">
                  <SerialsInput value={line.serialsText} onChange={set("serialsText")} name={product.name} />
                </Field>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default PurchaseItemList;
