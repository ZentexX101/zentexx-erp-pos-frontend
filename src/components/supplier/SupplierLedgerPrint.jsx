import BrandLogo from "../common/brand/BrandLogo";
import { LEDGER_TYPE_LABELS } from "../../constants/supplier";
import { formatDateTime, formatShortDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import { supplierBalanceMeaning } from "../../utils/supplier";
import SupplierBalance from "./SupplierBalance";

const cell = "border-b border-slate-200 px-2 py-1.5";

// Printable statement (only visible when printing). Reads oldest to newest like a bank statement,
// with the opening and closing balance of the period when the whole period is included.
const SupplierLedgerPrint = ({ supplier, summary, entries, total, filters }) => {
  const rows = [...entries].reverse();
  const complete = entries.length === total;
  const showBalances = complete && !filters.type;
  const period =
    filters.from || filters.to ? `${filters.from || "Start"} to ${filters.to || formatShortDate(new Date())}` : "All time";

  return (
    <div className="hidden text-[11px] text-slate-800 print:block">
      <header className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
        <div>
          <h1>
            <BrandLogo className="h-10" />
          </h1>
          <p className="text-sm font-semibold text-slate-600">Supplier Ledger Report</p>
          <p className="mt-1 text-slate-500">
            Period: {period}
            {filters.type && ` · ${LEDGER_TYPE_LABELS[filters.type]?.label} only`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">{supplier.name}</p>
          <p>{formatPhone(supplier.phone)}</p>
          <p>{supplier.address}</p>
          <p className="mt-1">
            Current Balance: <SupplierBalance amount={supplier.balance} showMeaning />
          </p>
        </div>
      </header>

      <table className="mt-3 w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-100">
            {["#", "Date", "Type", "Ref.", "Branch", "Note"].map((h) => (
              <th key={h} className={`${cell} font-semibold`}>
                {h}
              </th>
            ))}
            {["Debit", "Credit", "Balance"].map((h) => (
              <th key={h} className={`${cell} text-right font-semibold`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showBalances && (
            <tr className="bg-slate-50 font-semibold">
              <td className={cell} colSpan={8}>
                Opening balance
              </td>
              <td className={`${cell} text-right`}>
                <SupplierBalance amount={summary.openingBalance} />
              </td>
            </tr>
          )}
          {rows.map((e, i) => (
            <tr key={e._id}>
              <td className={cell}>{i + 1}</td>
              <td className={`${cell} whitespace-nowrap`}>{formatDateTime(e.date)}</td>
              <td className={cell}>{LEDGER_TYPE_LABELS[e.type]?.label ?? e.type}</td>
              <td className={cell}>{e.reference || "—"}</td>
              <td className={cell}>{e.branch?.name ?? "Main admin"}</td>
              <td className={cell}>{e.note || "—"}</td>
              <td className={`${cell} text-right text-red-600`}>{e.debit ? formatTaka(e.debit) : "—"}</td>
              <td className={`${cell} text-right text-green-600`}>{e.credit ? formatTaka(e.credit) : "—"}</td>
              <td className={`${cell} text-right`}>
                <SupplierBalance amount={e.balanceAfter} />
              </td>
            </tr>
          ))}
          <tr className="bg-slate-100 font-semibold">
            <td className={cell} colSpan={6}>
              Total ({summary.entryCount} entries)
            </td>
            <td className={`${cell} text-right text-red-600`}>{formatTaka(summary.totalDebit)}</td>
            <td className={`${cell} text-right text-green-600`}>{formatTaka(summary.totalCredit)}</td>
            <td className={`${cell} text-right`}>{showBalances && <SupplierBalance amount={summary.closingBalance} />}</td>
          </tr>
        </tbody>
      </table>

      {showBalances && (
        <p className="mt-3 text-sm font-semibold">
          Closing balance: <SupplierBalance amount={summary.closingBalance} /> ({supplierBalanceMeaning(summary.closingBalance)})
        </p>
      )}
      {!complete && <p className="mt-3 text-slate-500">Showing the latest {entries.length} of {total} entries. Narrow the dates to print the rest.</p>}

      <footer className="mt-6 flex justify-between border-t border-slate-200 pt-2 text-slate-400">
        <span>Green = we pay the supplier · Red = the supplier pays us</span>
        <span>Printed {formatDateTime(new Date())}</span>
      </footer>
    </div>
  );
};

export default SupplierLedgerPrint;
