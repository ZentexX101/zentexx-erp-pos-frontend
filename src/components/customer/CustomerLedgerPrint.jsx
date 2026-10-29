import BrandLogo from "../common/brand/BrandLogo";
import { LEDGER_TYPE_LABELS } from "../../constants/customer";
import { formatDateTime, formatShortDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import { customerBalanceMeaning } from "../../utils/customer";
import CustomerBalance from "./CustomerBalance";

const cell = "border-b border-slate-200 px-2 py-1.5";

// Printable statement (only visible when printing). Reads oldest to newest like a bank statement,
// with the opening and closing balance of the period when the whole period is included.
const CustomerLedgerPrint = ({ customer, summary, entries, total, filters }) => {
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
          <p className="text-sm font-semibold text-slate-600">Customer Ledger Report</p>
          <p className="mt-1 text-slate-500">
            Period: {period}
            {filters.type && ` · ${LEDGER_TYPE_LABELS[filters.type]?.label} only`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">{customer.name}</p>
          <p>{formatPhone(customer.phone)}</p>
          <p>{customer.address}</p>
          <p className="mt-1">
            Current Balance: <CustomerBalance amount={customer.balance} showMeaning />
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
                <CustomerBalance amount={summary.openingBalance} />
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
                <CustomerBalance amount={e.balanceAfter} />
              </td>
            </tr>
          ))}
          <tr className="bg-slate-100 font-semibold">
            <td className={cell} colSpan={6}>
              Total ({summary.entryCount} entries)
            </td>
            <td className={`${cell} text-right text-red-600`}>{formatTaka(summary.totalDebit)}</td>
            <td className={`${cell} text-right text-green-600`}>{formatTaka(summary.totalCredit)}</td>
            <td className={`${cell} text-right`}>{showBalances && <CustomerBalance amount={summary.closingBalance} />}</td>
          </tr>
        </tbody>
      </table>

      {showBalances && (
        <p className="mt-3 text-sm font-semibold">
          Closing balance: <CustomerBalance amount={summary.closingBalance} /> ({customerBalanceMeaning(summary.closingBalance)})
        </p>
      )}
      {!complete && <p className="mt-3 text-slate-500">Showing the latest {entries.length} of {total} entries. Narrow the dates to print the rest.</p>}

      <footer className="mt-6 flex justify-between border-t border-slate-200 pt-2 text-slate-400">
        <span>Red = the customer pays us · Green = we pay the customer</span>
        <span>Printed {formatDateTime(new Date())}</span>
      </footer>
    </div>
  );
};

export default CustomerLedgerPrint;
