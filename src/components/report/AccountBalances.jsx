import { useState } from "react";
import { Link } from "react-router";
import { paymentMethodStatementPath } from "../../constants/routes";
import { formatTaka } from "../../utils/money";

const cell = "px-4 py-3 text-right tabular-nums whitespace-nowrap";

// Each payment method's opening + in − out = closing. Methods with no money and no movement are
// folded away (a shop can have many), with a button to show them. linkable: open a method's statement.
const AccountBalances = ({ accounts, summary, showBranch, linkable }) => {
  const [showEmpty, setShowEmpty] = useState(false);
  const isEmpty = (a) => !a.opening && !a.inflow && !a.outflow && !a.closing;
  const emptyCount = accounts.filter(isEmpty).length;
  const rows = showEmpty ? accounts : accounts.filter((a) => !isEmpty(a));

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <h2 className="font-semibold text-slate-900">Accounts</h2>
        {emptyCount > 0 && (
          <button
            type="button"
            onClick={() => setShowEmpty((was) => !was)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline print:hidden"
          >
            {showEmpty ? "Hide empty accounts" : `Show ${emptyCount} empty account${emptyCount === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Account</th>
              <th className="px-4 py-2.5 text-right font-semibold">Opening</th>
              <th className="px-4 py-2.5 text-right font-semibold">Money in</th>
              <th className="px-4 py-2.5 text-right font-semibold">Money out</th>
              <th className="px-4 py-2.5 text-right font-semibold">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((a) => (
              <tr key={a._id}>
                <td className="px-5 py-3">
                  {linkable ? (
                    <Link to={paymentMethodStatementPath(a._id)} className="font-medium text-slate-900 hover:underline">
                      {a.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-900">{a.name}</span>
                  )}
                  {showBranch && <span className="block text-xs text-slate-500">{a.branch ?? "—"}</span>}
                </td>
                <td className={`${cell} text-slate-600`}>{formatTaka(a.opening)}</td>
                <td className={`${cell} ${a.inflow ? "text-emerald-700" : "text-slate-300"}`}>{formatTaka(a.inflow)}</td>
                <td className={`${cell} ${a.outflow ? "text-red-700" : "text-slate-300"}`}>{formatTaka(a.outflow)}</td>
                <td className={`${cell} font-semibold text-slate-900`}>{formatTaka(a.closing)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
            <tr>
              <td className="px-5 py-3">Total</td>
              <td className={cell}>{formatTaka(summary.opening)}</td>
              <td className={`${cell} text-emerald-700`}>{formatTaka(summary.inflow)}</td>
              <td className={`${cell} text-red-700`}>{formatTaka(summary.outflow)}</td>
              <td className={cell}>{formatTaka(summary.closing)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default AccountBalances;
