import { LuBoxes, LuShoppingBag, LuTriangleAlert, LuUndo2, LuWallet } from "react-icons/lu";
import { formatTaka } from "../../utils/money";

const Card = ({ icon, label, value, tone }) => {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold tabular-nums text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const pcs = (n) => `${(n ?? 0).toLocaleString("en-IN")} pcs`;

// All branches together. IMEI products also show how many pieces were sold, returned or put aside;
// quantity-only products just have the in-stock count and its value.
const ProductStockSummary = ({ trackSerial, counts, stockValue }) => (
  <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${trackSerial ? "lg:grid-cols-5" : ""}`}>
    <Card icon={LuBoxes} label="In stock" value={pcs(counts.in_stock)} tone="bg-green-50 text-green-600" />
    {trackSerial && (
      <>
        <Card icon={LuShoppingBag} label="Sold" value={pcs(counts.sold)} tone="bg-blue-50 text-blue-600" />
        <Card icon={LuUndo2} label="Returned" value={pcs(counts.returned)} tone="bg-amber-50 text-amber-600" />
        <Card
          icon={LuTriangleAlert}
          label="Damaged / Written off"
          value={pcs((counts.damaged ?? 0) + (counts.written_off ?? 0))}
          tone="bg-red-50 text-red-600"
        />
      </>
    )}
    <Card icon={LuWallet} label="Stock value (buying)" value={formatTaka(stockValue)} tone="bg-purple-50 text-purple-600" />
  </div>
);

export default ProductStockSummary;
