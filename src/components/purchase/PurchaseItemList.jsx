import { LuPackagePlus, LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { lineQuantity, lineTotal } from "../../utils/purchase";
import { parseSerials, repeatedSerials } from "../../utils/serials";
import Badge from "../common/data/Badge";
import ProductThumb from "./ProductThumb";

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
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-5 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <LuPackagePlus className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-3 font-semibold text-slate-800">No products added yet</p>
        <p className="mt-1 text-sm text-slate-500">Click <span className="font-semibold text-slate-700">Add</span> on a product above to add it to this purchase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-900">
          Purchase Items <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{lines.length}</span>
        </h2>
        <p className="text-xs text-slate-500">
          {lines.reduce((sum, line) => sum + lineQuantity(line), 0)} pcs in total
        </p>
      </div>
      {lines.map((line, index) => {
        const { product } = line;
        const set = (field) => (value) => onChange(index, field, value);
        return (
          <section key={product._id} className="min-w-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="hidden w-5 shrink-0 text-center text-xs font-semibold text-slate-400 sm:block">{index + 1}</span>
                <ProductThumb product={product} />
                <div className="min-w-0 space-y-1">
                  <h3 className="break-words font-semibold uppercase leading-tight text-slate-900">{product.name}</h3>
                  {product.trackSerial ? (
                    <Badge tone="purple">IMEI Product · {lineQuantity(line)} pcs</Badge>
                  ) : (
                    <Badge tone="blue">Simple Product</Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <div className="text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Line total</p>
                  <p className="font-bold tabular-nums text-slate-900">{formatTaka(lineTotal(line))}</p>
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

            {/* Phones: selling and buying price side by side, quantity (and IMEIs) across under them; md: one row */}
            <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 md:grid-cols-3 md:gap-4">
              <Field label="Selling Price">
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

              <Field
                label={product.trackSerial ? "Quantity (from IMEIs)" : "Quantity"}
                required={!product.trackSerial}
                className="col-span-2 max-md:order-last md:col-span-1"
              >
                <input
                  inputMode="numeric"
                  value={product.trackSerial ? String(lineQuantity(line)) : line.quantity}
                  onChange={(e) => set("quantity")(toIntegerInput(e.target.value))}
                  readOnly={product.trackSerial}
                  className={`${inputClass} ${product.trackSerial ? "bg-slate-50 text-slate-500" : ""}`}
                />
              </Field>

              <Field label="Buying Price" required>
                <input
                  inputMode="decimal"
                  placeholder="Enter buying price"
                  value={line.unitCost}
                  onChange={(e) => set("unitCost")(toDecimalInput(e.target.value))}
                  className={inputClass}
                />
              </Field>

              {product.trackSerial && (
                <Field label="IMEI / Serial Numbers" required className="col-span-2 max-md:order-last md:col-span-3">
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
