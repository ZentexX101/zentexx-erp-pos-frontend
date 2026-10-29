import { LuBoxes, LuPackage, LuWallet } from "react-icons/lu";
import { formatTaka } from "../../utils/money";

const Card = ({ icon, label, value, tone }) => {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

// Totals for every row that matches the filters (not just this page)
const StockSummary = ({ summary }) => (
  <div className="grid gap-4 sm:grid-cols-3">
    <Card icon={LuPackage} label="Products" value={summary?.products ?? 0} tone="bg-purple-50 text-purple-600" />
    <Card icon={LuBoxes} label="Stock Units" value={summary?.quantity ?? 0} tone="bg-blue-50 text-blue-600" />
    <Card icon={LuWallet} label="Stock Value (buying)" value={formatTaka(summary?.value ?? 0)} tone="bg-green-50 text-green-600" />
  </div>
);

export default StockSummary;
