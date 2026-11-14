import { useState } from "react";
import { LuScanLine, LuSearch, LuTrash2 } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useTransferLookup,
  useTransferSerialsData,
  useTransferStockData,
} from "../../hooks/useTransferApi";
import { toIntegerInput } from "../../utils/number";
import Badge from "../common/data/Badge";
import Spinner from "../common/loaders/Spinner";
import VariantChips from "../product/VariantChips";
import StockSearchSelect from "../stock/StockSearchSelect";

// Tick the IMEIs to send from the sending branch. A search box and "Select all" help when there are many.
const SerialChecklist = ({ branch, productId, selected, onChange }) => {
  const [filter, setFilter] = useState("");
  const { data: units = [], isLoading } = useTransferSerialsData(
    branch,
    productId,
  );
  if (isLoading) return <Spinner className="h-4 w-4 text-indigo-600" />;
  if (!units.length)
    return <p className="text-xs text-slate-500">No IMEI in stock.</p>;

  const term = filter.trim().toUpperCase();
  const shown = term
    ? units.filter((unit) => unit.serial.includes(term))
    : units;
  const allShownPicked =
    shown.length > 0 && shown.every((unit) => selected.includes(unit.serial));
  const toggleAll = () => {
    const shownSerials = shown.map((unit) => unit.serial);
    onChange(
      allShownPicked
        ? selected.filter((s) => !shownSerials.includes(s))
        : [...new Set([...selected, ...shownSerials])],
    );
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">
          IMEI{" "}
          <span className="font-normal text-slate-500">
            · {selected.length} of {units.length} picked
          </span>
        </span>
        <button
          type="button"
          onClick={toggleAll}
          disabled={!shown.length}
          className="font-semibold text-indigo-600 hover:underline disabled:opacity-40"
        >
          {allShownPicked ? "Clear" : "Select all"}
        </button>
      </div>
      {units.length > 5 && (
        <div className="relative">
          <LuSearch
            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Find IMEI..."
            aria-label="Find IMEI"
            className="w-full rounded-md border border-slate-300 bg-white py-1 pl-7 pr-2 font-mono text-xs outline-none placeholder:font-sans focus:ring-2 focus:ring-brand/10"
          />
        </div>
      )}
      <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-md border border-slate-200 bg-white p-1.5">
        {shown.length === 0 && (
          <p className="px-1 py-1 text-xs text-slate-500">No IMEI matches.</p>
        )}
        {shown.map((unit) => (
          <label
            key={unit._id}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.includes(unit.serial)}
              onChange={() =>
                onChange(
                  selected.includes(unit.serial)
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
    </div>
  );
};

const newLine = (stock) => ({
  stock,
  quantity: "1",
  serials: [],
  productCode: stock.product.barcode ?? "",
});

// The products being sent. lines: [{ stock, quantity, serials, productCode }]; onChange(next).
// Products and IMEIs come from the sending branch's stock. Mobiles go by IMEI; other products by quantity
// with an optional product ID (their barcode to start with). Scanning an IMEI / product ID + Enter adds it.
const TransferItems = ({ fromBranch, lines, onChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const [scan, setScan] = useState(null); // { tone: "error" | "ok", text }
  const search = useDebouncedValue(searchInput.trim());
  const { data: rows = [], isFetching } = useTransferStockData(
    fromBranch,
    search,
  );
  const lookup = useTransferLookup();

  const indexOf = (productId) =>
    lines.findIndex((line) => line.stock.product._id === productId);
  const set = (index, patch) =>
    onChange(
      lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );

  const add = (stock) => {
    setScan(null);
    if (indexOf(stock.product._id) >= 0) return;
    onChange([...lines, newLine(stock)]);
  };

  // Enter in the search box: an IMEI ticks that piece, a product ID adds the product (or one more of it)
  const handleScan = async (code) => {
    try {
      const { serial, stock } = await lookup(fromBranch, code);
      const index = indexOf(stock.product._id);
      if (serial) {
        if (index >= 0 && lines[index].serials.includes(serial)) {
          setScan({ tone: "error", text: `IMEI ${serial} is already added.` });
          return true;
        }
        onChange(
          index >= 0
            ? lines.map((line, i) =>
                i === index
                  ? { ...line, serials: [...line.serials, serial] }
                  : line,
              )
            : [...lines, { ...newLine(stock), serials: [serial] }],
        );
        setScan({
          tone: "ok",
          text: `Added IMEI ${serial} (${stock.product.name}).`,
        });
      } else if (index >= 0) {
        const next = (Number(lines[index].quantity) || 0) + 1;
        if (!stock.product.trackSerial && next > stock.quantity) {
          setScan({
            tone: "error",
            text: `Only ${stock.quantity} of ${stock.product.name} in stock.`,
          });
          return true;
        }
        if (!stock.product.trackSerial)
          set(index, { quantity: String(next) });
        setScan({
          tone: "ok",
          text: stock.product.trackSerial
            ? `${stock.product.name} is already added; tick its IMEIs.`
            : `One more ${stock.product.name}.`,
        });
      } else {
        onChange([...lines, newLine(stock)]);
        setScan({ tone: "ok", text: `Added ${stock.product.name}.` });
      }
      return true;
    } catch (err) {
      setScan({ tone: "error", text: err.message });
      return false;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <StockSearchSelect
          label="Products to send *"
          placeholder="Search product, or scan IMEI / product ID + Enter..."
          searchInput={searchInput}
          onSearchInput={(value) => {
            setScan(null);
            setSearchInput(value);
          }}
          rows={rows}
          loading={isFetching}
          onPick={add}
          onEnter={handleScan}
        />
        {scan ? (
          <p
            className={`mt-1 text-xs ${scan.tone === "error" ? "text-red-600" : "text-green-700"}`}
          >
            {scan.text}
          </p>
        ) : (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <LuScanLine className="h-3.5 w-3.5" aria-hidden="true" />
            Scan or type an IMEI / product ID and press Enter to add it
            directly.
          </p>
        )}
      </div>

      {lines.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No products added yet.
        </p>
      )}

      {lines.map((line, index) => {
        const { product } = line.stock;
        const overStock =
          !product.trackSerial &&
          (Number(line.quantity) || 0) > line.stock.quantity;
        return (
          <div
            key={product._id}
            className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_16rem_auto]"
          >
            <div className="min-w-0 space-y-1.5">
              <p className="break-words font-medium uppercase text-slate-900">
                {product.name}
              </p>
              <VariantChips variant={product.variant} />
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                In stock: {line.stock.quantity}
                {product.trackSerial ? (
                  <Badge tone="purple">
                    IMEI · {line.serials.length} picked
                  </Badge>
                ) : (
                  <Badge>Product ID</Badge>
                )}
              </p>
            </div>
            <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              {product.trackSerial ? (
                <SerialChecklist
                  branch={fromBranch}
                  productId={product._id}
                  selected={line.serials}
                  onChange={(serials) => set(index, { serials })}
                />
              ) : (
                <div className="grid grid-cols-[5rem_1fr] gap-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Quantity
                    <input
                      inputMode="numeric"
                      value={line.quantity}
                      onChange={(e) =>
                        set(index, { quantity: toIntegerInput(e.target.value) })
                      }
                      aria-invalid={overStock || undefined}
                      className={`mt-1 w-full rounded-md border px-2 py-1.5 text-sm font-normal outline-none focus:ring-2 ${
                        overStock
                          ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-100"
                          : "border-slate-300 focus:ring-brand/10"
                      }`}
                    />
                    {/* Can't send more than the sending branch has */}
                    {overStock && (
                      <span className="mt-1 block font-normal text-red-600">
                        Max {line.stock.quantity}
                      </span>
                    )}
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Product ID{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                    <input
                      value={line.productCode}
                      maxLength={300}
                      onChange={(e) =>
                        set(index, { productCode: e.target.value })
                      }
                      placeholder="Barcode / ID"
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm font-normal outline-none placeholder:font-sans focus:ring-2 focus:ring-brand/10"
                    />
                  </label>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange(lines.filter((_, i) => i !== index))}
              className="col-start-2 row-start-1 rounded-md p-1.5 text-slate-400 sm:col-start-3 hover:bg-red-50 hover:text-red-600"
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

export default TransferItems;
