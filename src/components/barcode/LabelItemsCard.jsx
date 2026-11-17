import { LuBarcode, LuPackagePlus, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { MAX_COPIES } from "../../utils/barcodeLabels";
import { formatTaka } from "../../utils/money";
import { toIntegerInput } from "../../utils/number";
import Button from "../common/buttons/Button";
import Badge from "../common/data/Badge";
import StockSearchSelect from "../stock/StockSearchSelect";
import { SectionHeading } from "../purchase/PickerCard";
import ProductThumb from "../purchase/ProductThumb";

// The products to print labels for: search / scan to add, how many labels each, and a warning (with
// "Generate barcodes") when some have no barcode yet.
// items: [{ key, product, price, quantity, copies }]
const LabelItemsCard = ({
  items,
  searchInput,
  onSearchInput,
  searchRows,
  searching,
  onPick,
  onEnter,
  onAddAll,
  addingAll,
  onCopies,
  onRemove,
  onClear,
  onGenerate,
  generating,
  canGenerate,
}) => {
  const missing = items.filter((item) => !item.product.barcode);

  return (
    <section className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <SectionHeading
        step="1"
        eyebrow="Products"
        title="Pick products to label"
        className="mb-4"
        actions={
          <>
            <Button variant="secondary" onClick={onAddAll} loading={addingAll}>
              <LuPackagePlus className="h-4 w-4" aria-hidden="true" />
              Add all in stock
            </Button>
            {items.length > 0 && (
              <Button variant="secondary" onClick={onClear}>
                Clear
              </Button>
            )}
          </>
        }
      />

      <StockSearchSelect
        placeholder="Search product, or scan its barcode + Enter"
        searchInput={searchInput}
        onSearchInput={onSearchInput}
        rows={searchRows}
        loading={searching}
        onPick={onPick}
        onEnter={onEnter}
      />

      {missing.length > 0 && (
        <div className="mt-3 flex flex-col gap-3 rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2 text-sm text-amber-900">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              <span className="font-semibold">
                {missing.length} product{missing.length === 1 ? " has" : "s have"} no barcode.
              </span>{" "}
              {canGenerate ? "Generate our own codes for them, then print." : "Ask an admin to generate barcodes for them."}
            </span>
          </p>
          {canGenerate && (
            <Button onClick={() => onGenerate(missing.map((item) => item.product._id))} loading={generating} className="shrink-0">
              <LuBarcode className="h-4 w-4" aria-hidden="true" />
              Generate {missing.length} barcode{missing.length === 1 ? "" : "s"}
            </Button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-3 flex flex-col items-center rounded-lg border-2 border-dashed border-slate-200 px-5 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <LuBarcode className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold text-slate-800">No products yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Search or scan above, or press <span className="font-semibold text-slate-700">Add all in stock</span> to label everything that's on the
            shelf (mobiles with IMEI are left out).
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {items.map((item) => (
            <li key={item.key} className="flex flex-wrap items-center gap-3 px-3 py-2.5 sm:flex-nowrap">
              <ProductThumb product={item.product} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold uppercase text-slate-900">{item.product.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  {item.product.barcode ? (
                    <span className="font-mono text-slate-700">{item.product.barcode}</span>
                  ) : (
                    <Badge tone="amber">No barcode</Badge>
                  )}
                  <span>·</span>
                  <span>{Number(item.price) > 0 ? formatTaka(item.price) : "No selling price"}</span>
                  <span>·</span>
                  <span>{item.quantity} in stock</span>
                  {item.product.trackSerial && <Badge tone="purple">IMEI</Badge>}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                Labels
                <input
                  inputMode="numeric"
                  value={item.copies}
                  onChange={(e) => onCopies(item.key, toIntegerInput(e.target.value).slice(0, 3))}
                  onBlur={() => onCopies(item.key, String(Math.min(Number(item.copies) || 0, MAX_COPIES)))}
                  aria-label={`Number of labels for ${item.product.name}`}
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
                />
              </label>
              <button
                type="button"
                onClick={() => onRemove(item.key)}
                className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${item.product.name}`}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LabelItemsCard;
