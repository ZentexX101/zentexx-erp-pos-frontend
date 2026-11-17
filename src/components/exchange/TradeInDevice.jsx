import { useState } from "react";
import { LuScanLine, LuTrash2 } from "react-icons/lu";
import { useLookupExchangeDevice } from "../../hooks/useSaleApi";
import { isPreownedProduct, tradeInQuantity } from "../../utils/exchange";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import Spinner from "../common/loaders/Spinner";
import ProductSelect from "../product/ProductSelect";
import ConditionPicker from "./ConditionPicker";
import DeviceOriginCard from "./DeviceOriginCard";
import PreownedSuggest from "./PreownedSuggest";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-0.5 block text-[11px] text-slate-500">{hint}</span>}
  </label>
);

// One old device: its IMEI first (scan + Enter, or leave the box) to see where it came from, then the
// product it goes into stock as, its value, resale price and (optional) condition.
// line: see utils/exchange newTradeIn; onChange(patch); onRemove (null = can't remove the only row)
const TradeInDevice = ({ index, line, onChange, onRemove, customer, hint, branchId }) => {
  const lookupDevice = useLookupExchangeDevice();
  const [checking, setChecking] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const serial = line.serial.trim().toUpperCase();
  const lookup = line.lookupFor && line.lookupFor === serial ? line.lookup : null;
  const usesImei = !line.product || line.product.trackSerial;

  const check = async () => {
    if (!serial || serial === line.lookupFor) return;
    setLookupError("");
    setChecking(true);
    try {
      const found = await lookupDevice(serial);
      const patch = { lookup: found, lookupFor: serial };
      // Our own device with a preowned listing: that's its product (unless one was already picked)
      if (found.preowned && !line.product) patch.product = found.preowned;
      onChange(patch);
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setChecking(false);
    }
  };

  // A new-product listing picked (or our sold product with no preowned listing yet): offer the preowned one
  const preownedBase = line.product
    ? isPreownedProduct(line.product)
      ? null
      : line.product
    : lookup?.sale?.product && !lookup.preowned
      ? lookup.sale.product
      : null;

  // A small pill next to the title once the IMEI was checked
  const status = !lookup
    ? null
    : lookup.inStock
      ? { label: "In stock", className: "bg-red-50 text-red-700 ring-red-200" }
      : lookup.sale
        ? { label: "Sold by us", className: "bg-blue-50 text-blue-700 ring-blue-200" }
        : { label: "Outside device", className: "bg-slate-100 text-slate-600 ring-slate-200" };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">{index + 1}</span>
          <p className="text-sm font-semibold text-slate-800">Device {index + 1}</p>
          {status && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}>{status.label}</span>}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove device ${index + 1}`}
          >
            <LuTrash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {usesImei && (
        <div className="space-y-2">
          <Field label="Device IMEI" hint="Scan or type, then press Enter — we check whether we sold it">
            <div className="relative">
              <LuScanLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={line.serial}
                onChange={(e) => onChange({ serial: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // a scanner sends Enter
                    check();
                  }
                }}
                onBlur={check}
                placeholder="Scan or type IMEI"
                autoComplete="off"
                spellCheck={false}
                className={`${inputClass} pl-9 pr-9 font-mono`}
              />
              {checking && <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600" />}
            </div>
          </Field>
          {lookupError && <p className="text-xs text-red-600">{lookupError}</p>}
          {lookup && <DeviceOriginCard lookup={lookup} customer={customer} hint={hint} branchId={branchId} />}
        </div>
      )}

      <ProductSelect
        label="Goes into stock as"
        placeholder="Search product to buy back..."
        value={line.product}
        onChange={(product) => onChange({ product, quantity: "1" })}
      />

      {preownedBase && <PreownedSuggest key={preownedBase._id} base={preownedBase} onPicked={(product) => onChange({ product })} />}

      {line.product && (
        <>
          <div className={`grid gap-3 ${line.product.trackSerial ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {!line.product.trackSerial && (
              <Field label="Quantity *">
                <input
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(e) => onChange({ quantity: toIntegerInput(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Buyback / Exchange Value (৳) *" hint="Its cost in your stock">
              <input
                inputMode="decimal"
                value={line.value}
                onChange={(e) => onChange({ value: toDecimalInput(e.target.value) })}
                placeholder="Amount in BDT"
                className={`${inputClass} border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-800 focus:border-emerald-400 focus:ring-emerald-100`}
              />
            </Field>
            <Field label="Resale Price (৳)" hint="Optional: its selling price in stock">
              <input
                inputMode="decimal"
                value={line.salePrice}
                onChange={(e) => onChange({ salePrice: toDecimalInput(e.target.value) })}
                placeholder="Keep current"
                className={inputClass}
              />
            </Field>
          </div>

          <ConditionPicker value={line.condition} onChange={(condition) => onChange({ condition })} />

          {tradeInQuantity(line) > 0 && Number(line.value) > 0 && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-900 ring-1 ring-emerald-200">
              Goes into stock: {tradeInQuantity(line)} × <span className="font-medium text-slate-800">{line.product.name}</span> at{" "}
              {formatTaka(Number(line.value))} each.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TradeInDevice;
