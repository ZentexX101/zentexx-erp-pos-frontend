import { LuArrowDownLeft, LuArrowUpRight, LuFlag, LuScale } from "react-icons/lu";
import { formatTaka } from "../../utils/money";

const StatCard = ({ icon, label, value, tone, valueClass }) => {
  const Icon = icon;
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 print:p-2 print:shadow-none">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg print:hidden ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className={`mt-3 text-xl font-semibold print:mt-1 print:text-base ${valueClass}`}>{formatTaka(value)}</p>
    </div>
  );
};

// The method, its current balance, and the period's opening / in / out / closing
const PaymentMethodStatementSummary = ({ paymentMethod, summary }) => (
  <div className="space-y-4">
    <div className="flex items-start justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 print:shadow-none">
      <div>
        <p className="text-sm text-slate-500">Payment Method</p>
        <h2 className="text-lg font-bold text-slate-900">{paymentMethod.name}</h2>
        {paymentMethod.description && <p className="text-sm text-slate-500">{paymentMethod.description}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-500">Current Balance</p>
        <p className="text-2xl font-bold text-green-600">{formatTaka(paymentMethod.balance)}</p>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4 print:gap-2">
      <StatCard icon={LuFlag} label="Opening Balance" value={summary.openingBalance} tone="bg-slate-100 text-slate-600" valueClass="text-slate-900" />
      <StatCard icon={LuArrowDownLeft} label="Total In" value={summary.totalIn} tone="bg-green-50 text-green-600" valueClass="text-green-600" />
      <StatCard icon={LuArrowUpRight} label="Total Out" value={summary.totalOut} tone="bg-red-50 text-red-600" valueClass="text-red-600" />
      <StatCard icon={LuScale} label="Closing Balance" value={summary.closingBalance} tone="bg-indigo-50 text-indigo-600" valueClass="text-indigo-600" />
    </div>
  </div>
);

export default PaymentMethodStatementSummary;
