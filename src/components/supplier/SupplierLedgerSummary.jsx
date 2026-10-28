import { LuArrowDownLeft, LuArrowUpRight, LuFlag, LuScale } from "react-icons/lu";
import { BUSINESS_NAME } from "../../constants/app";
import { formatPhone } from "../../utils/phone";
import { formatTaka } from "../../utils/money";
import { supplierBalanceMeaning } from "../../utils/supplier";
import SupplierBalance from "./SupplierBalance";

const StatCard = ({ icon, label, hint, children, tone }) => {
  const Icon = icon;
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-xs text-slate-400">{hint}</p>
        </div>
      </div>
      <div className="mt-3 text-xl">{children}</div>
    </div>
  );
};

// Supplier details, the current balance, and totals for the filtered period
const SupplierLedgerSummary = ({ supplier, summary, hasPeriod }) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{BUSINESS_NAME}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{supplier.name}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {formatPhone(supplier.phone)} · {supplier.address}
        </p>
      </div>
      <div className="sm:text-right">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Balance</p>
        <SupplierBalance amount={supplier.balance} className="mt-1 block text-2xl" />
        <p className="text-sm text-slate-500">{supplierBalanceMeaning(supplier.balance)}</p>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={LuFlag} label="Opening Balance" hint={hasPeriod ? "Before the selected period" : "Before the first entry"} tone="bg-slate-100 text-slate-600">
        <SupplierBalance amount={summary.openingBalance} />
      </StatCard>
      <StatCard icon={LuArrowUpRight} label="Total Credit" hint="Purchases & additions (দেনা বেড়েছে)" tone="bg-green-50 text-green-600">
        <span className="font-semibold text-green-600">{formatTaka(summary.totalCredit)}</span>
      </StatCard>
      <StatCard icon={LuArrowDownLeft} label="Total Debit" hint="Payments & returns (দেনা কমেছে)" tone="bg-red-50 text-red-600">
        <span className="font-semibold text-red-600">{formatTaka(summary.totalDebit)}</span>
      </StatCard>
      <StatCard icon={LuScale} label="Closing Balance" hint={`${summary.entryCount} entries in this view`} tone="bg-indigo-50 text-indigo-600">
        <SupplierBalance amount={summary.closingBalance} showMeaning />
      </StatCard>
    </div>
  </div>
);

export default SupplierLedgerSummary;
