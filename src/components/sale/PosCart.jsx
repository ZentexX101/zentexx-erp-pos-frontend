import { useState } from "react";
import { LuPencil, LuPlus, LuStore, LuTrash2, LuX } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import {
  externalQuantity,
  externalTotal,
  sourceOf,
} from "../../utils/externalProduct";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { cartLineQuantity, cartLineTotal } from "../../utils/sale";
import Spinner from "../common/loaders/Spinner";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// Pick IMEIs from this branch's stock for one cart line
const SerialPicker = ({ productId, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const { data: units = [], isLoading } = useStockSerialsData(
    productId,
    undefined,
    { enabled: open },
  );
  const picked = new Set(selected);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {selected.map((serial) => (
          <span
            key={serial}
            className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 font-mono text-[11px] text-purple-700"
          >
            {serial}
            <button
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== serial))}
              aria-label={`Remove ${serial}`}
            >
              <LuX className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-semibold text-indigo-600 hover:underline"
      >
        {open
          ? "Close IMEI list"
          : selected.length
            ? "Pick more IMEIs"
            : "Pick IMEI"}
      </button>
      {open &&
        (isLoading ? (
          <Spinner className="h-4 w-4 text-indigo-600" />
        ) : (
          <div className="max-h-36 space-y-1 overflow-y-auto rounded border border-slate-200 p-2">
            {units.length === 0 && (
              <p className="text-xs text-slate-500">No IMEI in stock.</p>
            )}
            {units.map((unit) => (
              <label
                key={unit._id}
                className="flex cursor-pointer items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={picked.has(unit.serial)}
                  onChange={() =>
                    onChange(
                      picked.has(unit.serial)
                        ? selected.filter((s) => s !== unit.serial)
                        : [...selected, unit.serial],
                    )
                  }
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
// externals: products brought in from elsewhere (not in stock), added / edited in a modal (onAddExternal, onEditExternal(index), onRemoveExternal(index)).
// Phones: each line is one stacked cell (the table's columns would not fit); the classic table from sm.
const wide = "hidden sm:table-cell";
const PhoneField = ({ label, children }) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[11px] font-medium text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const PosCart = ({
  lines,
  onChange,
  onRemove,
  externals = [],
  onAddExternal,
  onEditExternal,
  onRemoveExternal,
}) => (
  <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2.5 sm:hidden">
      <p className="text-sm font-semibold text-slate-700">Cart</p>
      <p className="text-xs text-slate-500">
        {lines.length + externals.length}{" "}
        {lines.length + externals.length === 1 ? "product" : "products"}
      </p>
    </div>
    <div className="sm:overflow-x-auto">
      <table className="w-full text-left text-sm sm:min-w-[520px] xl:min-w-0">
        <thead className="hidden bg-slate-50 text-slate-600 sm:table-header-group">
          <tr>
            <th className="px-3 py-2.5 font-semibold">Product</th>
            <th className="w-20 px-3 py-2.5 font-semibold">Qty</th>
            <th className="w-24 px-3 py-2.5 font-semibold">Price</th>
            <th className="px-3 py-2.5 text-right font-semibold">Total</th>
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.length === 0 && externals.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-slate-500">
                No products added yet.
                <span className="block text-xs">
                  Click a product or scan an IMEI to begin the sale. Not in
                  stock? Add it as an external product.
                </span>
              </td>
            </tr>
          ) : (
            lines.map((line, index) => {
              const { product } = line.stock;
              const qtyField = product.trackSerial ? (
                <SerialPicker
                  productId={product._id}
                  selected={line.serials}
                  onChange={(serials) => onChange(index, "serials", serials)}
                />
              ) : (
                <input
                  inputMode="numeric"
                  aria-label={`Quantity of ${product.name}`}
                  value={line.quantity}
                  onChange={(e) =>
                    onChange(index, "quantity", toIntegerInput(e.target.value))
                  }
                  className={inputClass}
                />
              );
              const priceField = (
                <input
                  inputMode="decimal"
                  aria-label={`Selling price of ${product.name}`}
                  value={line.unitPrice}
                  onChange={(e) =>
                    onChange(index, "unitPrice", toDecimalInput(e.target.value))
                  }
                  className={inputClass}
                />
              );
              const codeField = !product.trackSerial && (
                <input
                  aria-label={`IMEI / product ID of ${product.name}`}
                  value={line.productCode ?? ""}
                  onChange={(e) =>
                    onChange(index, "productCode", e.target.value)
                  }
                  placeholder="IMEI / Product ID (optional)"
                  maxLength={300}
                  spellCheck={false}
                  autoComplete="off"
                  className="mt-1.5 w-full min-w-0 rounded-md border border-dashed border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800 outline-none placeholder:font-sans placeholder:text-slate-400 focus:border-solid focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
                />
              );
              const removeButton = (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${product.name}`}
                >
                  <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              );
              return (
                <tr key={product._id} className="align-top">
                  {/* Phones */}
                  <td colSpan={5} className="px-3 py-3 sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium uppercase leading-snug text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          In stock: {line.stock.quantity}
                        </p>
                      </div>
                      {removeButton}
                    </div>
                    <div
                      className={`mt-2 grid gap-2 ${product.trackSerial ? "grid-cols-1" : "grid-cols-[4.5rem_minmax(0,1fr)_auto]"} items-end`}
                    >
                      <PhoneField label={product.trackSerial ? "IMEI" : "Qty"}>
                        {qtyField}
                      </PhoneField>
                      {product.trackSerial ? (
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                          <PhoneField label="Price">{priceField}</PhoneField>
                          <p className="pb-1.5 text-right font-semibold text-slate-900">
                            {formatTaka(cartLineTotal(line))}
                          </p>
                        </div>
                      ) : (
                        <>
                          <PhoneField label="Price">{priceField}</PhoneField>
                          <p className="pb-1.5 text-right font-semibold text-slate-900">
                            {formatTaka(cartLineTotal(line))}
                          </p>
                        </>
                      )}
                    </div>
                    {codeField}
                  </td>

                  {/* sm and up: the table */}
                  <td className={`px-3 py-2.5 ${wide}`}>
                    <p className="font-medium uppercase text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      In stock: {line.stock.quantity}
                    </p>
                    {codeField}
                  </td>
                  <td className={`px-3 py-2.5 ${wide}`}>{qtyField}</td>
                  <td className={`px-3 py-2.5 ${wide}`}>{priceField}</td>
                  <td
                    className={`whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900 ${wide}`}
                  >
                    {formatTaka(cartLineTotal(line))}
                    <span className="block text-xs font-normal text-slate-500">
                      × {cartLineQuantity(line)}
                    </span>
                  </td>
                  <td className={`px-2 py-2.5 ${wide}`}>{removeButton}</td>
                </tr>
              );
            })
          )}
          {externals.map((line, index) => (
            <tr key={line.key} className="align-top bg-amber-50/40">
              {/* Phones */}
              <td colSpan={5} className="px-3 py-3 sm:hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium uppercase leading-snug text-slate-900 [overflow-wrap:anywhere]">
                      {line.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                        <LuStore className="size-3" aria-hidden="true" />
                        External
                      </span>
                      <span>Buy {formatTaka(Number(line.unitCost) || 0)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditExternal(index)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit ${line.name}`}
                    >
                      <LuPencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveExternal(index)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${line.name}`}
                    >
                      <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {externalQuantity(line)} ×{" "}
                    {formatTaka(Number(line.unitPrice) || 0)}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatTaka(externalTotal(line))}
                  </span>
                </p>
              </td>

              {/* sm and up */}
              <td className={`px-3 py-2.5 ${wide}`}>
                <p className="font-medium uppercase text-slate-900 [overflow-wrap:anywhere]">
                  {line.name}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                    <LuStore className="size-3" aria-hidden="true" />
                    External
                  </span>
                  <span>Buy {formatTaka(Number(line.unitCost) || 0)}</span>
                  {sourceOf(line) && (
                    <span className="[overflow-wrap:anywhere]">
                      from {sourceOf(line)}
                    </span>
                  )}
                </p>
                {line.productCode.trim() && (
                  <p className="mt-0.5 font-mono text-xs text-slate-500 [overflow-wrap:anywhere]">
                    {line.productCode}
                  </p>
                )}
              </td>
              <td className={`px-3 py-2.5 text-slate-700 ${wide}`}>
                {externalQuantity(line)}
              </td>
              <td
                className={`whitespace-nowrap px-3 py-2.5 text-slate-700 ${wide}`}
              >
                {formatTaka(Number(line.unitPrice) || 0)}
              </td>
              <td
                className={`whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900 ${wide}`}
              >
                {formatTaka(externalTotal(line))}
              </td>
              <td className={`px-2 py-2.5 ${wide}`}>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onEditExternal(index)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Edit ${line.name}`}
                  >
                    <LuPencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveExternal(index)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${line.name}`}
                  >
                    <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {onAddExternal && (
      <div className="border-t border-slate-100 p-2.5">
        <button
          type="button"
          onClick={onAddExternal}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2.5 text-sm font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-50"
        >
          <LuPlus className="size-4" aria-hidden="true" />
          External product (not in stock)
        </button>
      </div>
    )}
  </section>
);

export default PosCart;
