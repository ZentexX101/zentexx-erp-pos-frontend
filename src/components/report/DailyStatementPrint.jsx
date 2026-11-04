import { FLOW_LABELS } from "../../constants/report";
import { formatTaka, takaInWords } from "../../utils/money";
import ReportPrintShell, { printCell, printHead, printHeadRight, printMoney, printTotal } from "./ReportPrintShell";

const MAX_METHODS = 4;

// The methods a source went through; past a few, just how many (each account has its own line further down)
const methodsText = (methods) =>
  methods.length > MAX_METHODS ? `${methods.length} accounts` : methods.map((m) => `${m.name} ${formatTaka(m.amount)}`).join(" · ");

// Money in or out: each source with the payment methods it went through
const FlowTable = ({ title, rows, total }) => (
  <table className="w-full break-inside-avoid">
    <thead>
      <tr>
        <th className={printHead}>{title}</th>
        <th className={printHeadRight}>Amount</th>
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 && (
        <tr>
          <td colSpan={2} className={`${printCell} text-slate-500`}>
            None in this period
          </td>
        </tr>
      )}
      {rows.map((row) => (
        <tr key={row.key}>
          <td className={printCell}>
            <span className="font-medium">{FLOW_LABELS[row.key] ?? row.key}</span>
            <span className="block text-[10px] text-slate-500">{methodsText(row.methods)}</span>
          </td>
          <td className={printMoney}>{formatTaka(row.amount)}</td>
        </tr>
      ))}
      <tr>
        <td className={printTotal}>Total</td>
        <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(total)}</td>
      </tr>
    </tbody>
  </table>
);

// The Daily Statement on paper: the balance sum, money in and out, then the accounts that have any money or movement
const DailyStatementPrint = ({ data, branchName, range, showBranch }) => {
  const { summary, inflows, outflows, accounts, notCash } = data;
  const shown = accounts.filter((a) => a.opening || a.inflow || a.outflow || a.closing);

  return (
    <ReportPrintShell title="Daily Statement" branchName={branchName} range={range}>
      <table className="w-full border border-slate-800 text-center">
        <tbody>
          <tr className="text-[10px] uppercase tracking-wide text-slate-600">
            <td className="px-2 pt-2">Opening balance</td>
            <td className="px-2 pt-2">+ Money in</td>
            <td className="px-2 pt-2">− Money out</td>
            <td className="px-2 pt-2">= Closing balance</td>
          </tr>
          <tr className="text-sm font-bold tabular-nums">
            <td className="px-2 pb-2">{formatTaka(summary.opening)}</td>
            <td className="px-2 pb-2">{formatTaka(summary.inflow)}</td>
            <td className="px-2 pb-2">{formatTaka(summary.outflow)}</td>
            <td className="px-2 pb-2">{formatTaka(summary.closing)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <span className="font-semibold">Closing balance in words:</span> {takaInWords(summary.closing)}
      </p>

      <div className="grid grid-cols-2 items-start gap-6">
        <FlowTable title="Money in" rows={inflows} total={summary.inflow} />
        <FlowTable title="Money out" rows={outflows} total={summary.outflow} />
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className={printHead}>Account</th>
            <th className={printHeadRight}>Opening</th>
            <th className={printHeadRight}>In</th>
            <th className={printHeadRight}>Out</th>
            <th className={printHeadRight}>Closing</th>
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 && (
            <tr>
              <td colSpan={5} className={`${printCell} text-slate-500`}>
                No account had money or movement in this period
              </td>
            </tr>
          )}
          {shown.map((a) => (
            <tr key={a._id} className="break-inside-avoid">
              <td className={printCell}>
                {a.name}
                {showBranch && <span className="text-slate-500"> · {a.branch ?? "—"}</span>}
              </td>
              <td className={printMoney}>{formatTaka(a.opening)}</td>
              <td className={printMoney}>{formatTaka(a.inflow)}</td>
              <td className={printMoney}>{formatTaka(a.outflow)}</td>
              <td className={`${printMoney} font-semibold`}>{formatTaka(a.closing)}</td>
            </tr>
          ))}
          <tr className="break-inside-avoid">
            <td className={printTotal}>Total</td>
            <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(summary.opening)}</td>
            <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(summary.inflow)}</td>
            <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(summary.outflow)}</td>
            <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(summary.closing)}</td>
          </tr>
        </tbody>
      </table>

      {(notCash.saleDue > 0 || notCash.purchaseDue > 0) && (
        <p className="text-[10px] text-slate-600">
          Not counted above, as no cash moved: sold on due {formatTaka(notCash.saleDue)}, bought on due {formatTaka(notCash.purchaseDue)}.
        </p>
      )}
    </ReportPrintShell>
  );
};

export default DailyStatementPrint;
