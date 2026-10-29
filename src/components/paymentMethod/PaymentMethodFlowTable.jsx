import { LEDGER_TYPE_LABELS } from "../../constants/paymentMethod";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import Badge from "../common/data/Badge";

const TONES = {
  in: { title: "text-green-700", amount: "text-green-600" },
  out: { title: "text-red-700", amount: "text-red-600" },
};

// One side of the statement: money in (direction "in") or money out ("out"), oldest first, with a total
const PaymentMethodFlowTable = ({ title, direction, lines, total, emptyMessage }) => {
  const tone = TONES[direction];
  const amountOf = (line) => (direction === "in" ? line.inflow : line.outflow);

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 print:break-inside-avoid print:shadow-none">
      <h3 className={`border-b border-slate-200 bg-slate-50 px-4 py-3 text-center text-base font-semibold ${tone.title}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm print:min-w-0 print:text-[11px]">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Type &amp; Date</th>
              <th className="px-4 py-2.5 font-semibold">Details</th>
              <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line._id} className="align-top">
                  <td className="px-4 py-2.5">
                    <Badge tone={LEDGER_TYPE_LABELS[line.type]?.tone}>{LEDGER_TYPE_LABELS[line.type]?.label ?? line.type}</Badge>
                    <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{formatDateTime(line.date)}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {line.note || "—"}
                    {line.reference && <p className="font-mono text-xs text-slate-500">Ref: {line.reference}</p>}
                    {line.createdBy?.name && <p className="text-xs text-slate-400">By {line.createdBy.name}</p>}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-2.5 text-right font-semibold ${tone.amount}`}>{formatTaka(amountOf(line))}</td>
                </tr>
              ))
            )}
          </tbody>
          {lines.length > 0 && (
            <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <td colSpan={2} className="px-4 py-2.5 text-slate-700">
                  Total
                </td>
                <td className={`whitespace-nowrap px-4 py-2.5 text-right ${tone.amount}`}>{formatTaka(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};

export default PaymentMethodFlowTable;
