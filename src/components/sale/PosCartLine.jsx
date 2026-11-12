import { LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { cartLineQuantity, cartLineServiceTotal, cartLineTotal } from "../../utils/sale";
import LineServices from "./LineServices";
import SerialPicker from "./SerialPicker";

const inputClass =
  "h-9 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

const Field = ({ label, children }) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

// One stock product in the cart: name and line total on top, then IMEIs / quantity and the selling price,
// then the services sold with it. onChange(field, value), onRemove(), onCreateService() (optional)
const PosCartLine = ({ line, serviceOptions, onChange, onRemove, onCreateService }) => {
  const { product } = line.stock;
  const pieces = cartLineQuantity(line);
  const serviceTotal = cartLineServiceTotal(line);

  return (
    <li className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold uppercase leading-snug text-slate-900">{product.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            In stock: {line.stock.quantity}
            {product.trackSerial && " · IMEI"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-slate-900">{formatTaka(cartLineTotal(line))}</p>
          <p className="text-[11px] tabular-nums text-slate-500">
            {pieces} × {formatTaka(Number(line.unitPrice) || 0)}
            {serviceTotal > 0 && <span className="block text-emerald-700">+ services {formatTaka(serviceTotal)}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1.5 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${product.name}`}
        >
          <LuTrash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_8.5rem] items-start gap-3">
        {product.trackSerial ? (
          <div className="min-w-0">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">IMEI ({pieces})</span>
            <SerialPicker productId={product._id} selected={line.serials} onChange={(serials) => onChange("serials", serials)} />
          </div>
        ) : (
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
            <Field label="Qty">
              <input
                inputMode="numeric"
                value={line.quantity}
                onChange={(e) => onChange("quantity", toIntegerInput(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="IMEI / ID">
              <input
                value={line.productCode ?? ""}
                onChange={(e) => onChange("productCode", e.target.value)}
                placeholder="Optional"
                maxLength={300}
                spellCheck={false}
                autoComplete="off"
                className={`${inputClass} font-mono text-xs placeholder:font-sans`}
              />
            </Field>
          </div>
        )}
        <Field label="Price">
          <input
            inputMode="decimal"
            value={line.unitPrice}
            onChange={(e) => onChange("unitPrice", toDecimalInput(e.target.value))}
            className={`${inputClass} text-right tabular-nums`}
          />
        </Field>
      </div>

      <LineServices line={line} options={serviceOptions} onChange={(services) => onChange("services", services)} onCreate={onCreateService} />
    </li>
  );
};

export default PosCartLine;
