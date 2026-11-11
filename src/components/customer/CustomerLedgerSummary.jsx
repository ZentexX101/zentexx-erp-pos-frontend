import { LuArrowDownLeft, LuArrowUpRight, LuFlag, LuScale } from "react-icons/lu";
import { BUSINESS_NAME } from "../../constants/app";
import { formatPhone } from "../../utils/phone";
import { formatTaka } from "../../utils/money";
import { customerBalanceMeaning } from "../../utils/customer";
import CustomerBalance from "./CustomerBalance";

const StatCard = ({ icon, label, hint, children, tone }) => {
  const Icon = icon;
  return (
    <div className="min-w-0 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200 sm:p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 ${tone}`}>
          <Icon className="size-4 sm:size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-slate-500 sm:truncate sm:text-xs">{label}</p>
          <p className="hidden truncate text-xs text-slate-400 sm:block">{hint}</p>
        </div>
      </div>
      <div className="mt-2.5 break-all text-base sm:mt-3 sm:text-xl">{children}</div>
    </div>
  );
};

// Customer details, the current balance, and totals for the filtered period
const CustomerLedgerSummary = ({ customer, summary, hasPeriod }) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{BUSINESS_NAME}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{customer.name}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {formatPhone(customer.phone)} · {customer.address}
        </p>
      </div>
      <div className="border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:text-right">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Balance</p>
        <CustomerBalance amount={customer.balance} className="mt-1 block text-2xl" />
        <p className="text-sm text-slate-500">{customerBalanceMeaning(customer.balance)}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard icon={LuFlag} label="Opening Balance" hint={hasPeriod ? "Before the selected period" : "Before the first entry"} tone="bg-slate-100 text-slate-600">
        <CustomerBalance amount={summary.openingBalance} />
      </StatCard>
      <StatCard icon={LuArrowUpRight} label="Total Debit" hint="Sales & payouts (পাওনা বেড়েছে)" tone="bg-red-50 text-red-600">
        <span className="font-semibold text-red-600">{formatTaka(summary.totalDebit)}</span>
      </StatCard>
      <StatCard icon={LuArrowDownLeft} label="Total Credit" hint="Payments & returns (পাওনা কমেছে)" tone="bg-green-50 text-green-600">
        <span className="font-semibold text-green-600">{formatTaka(summary.totalCredit)}</span>
      </StatCard>
      <StatCard icon={LuScale} label="Closing Balance" hint={`${summary.entryCount} entries in this view`} tone="bg-indigo-50 text-indigo-600">
        <CustomerBalance amount={summary.closingBalance} showMeaning />
      </StatCard>
    </div>
  </div>
);

export default CustomerLedgerSummary;
