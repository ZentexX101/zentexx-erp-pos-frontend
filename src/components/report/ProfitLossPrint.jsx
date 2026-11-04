import { EXPENSE_LABELS } from "../../constants/report";
import { percentOf } from "../../utils/chart";
import { formatTaka, takaInWords } from "../../utils/money";
import ReportPrintShell, { printCell, printHead, printHeadRight, printMoney, printTotal } from "./ReportPrintShell";

const Row = ({ label, value, less }) => (
  <tr className="break-inside-avoid">
    <td className={`${printCell} ${less ? "pl-5" : ""}`}>{label}</td>
    <td className={printMoney}>
      {less && value > 0 ? "− " : ""}
      {formatTaka(value)}
    </td>
  </tr>
);

const Subtotal = ({ label, value }) => (
  <tr className="break-inside-avoid font-semibold">
    <td className="border-b border-t border-slate-500 px-2 py-1">{label}</td>
    <td className="whitespace-nowrap border-b border-t border-slate-500 px-2 py-1 text-right tabular-nums">{formatTaka(value)}</td>
  </tr>
);

const Section = ({ children }) => (
  <tr>
    <td colSpan={2} className="px-2 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
      {children}
    </td>
  </tr>
);

// Profit & Loss on paper: the statement down to the net profit, then where the expenses went
const ProfitLossPrint = ({ report, branchName, range }) => (
  <ReportPrintShell title="Profit & Loss Statement" branchName={branchName} range={range}>
    <table className="w-full">
      <thead>
        <tr>
          <th className={printHead}>Particulars</th>
          <th className={printHeadRight}>Amount</th>
        </tr>
      </thead>
      <tbody>
        <Section>Product sales</Section>
        <Row label={`Sales (${report.orders} orders)`} value={report.revenue} />
        <Row label="Discounts" value={report.discount} less />
        <Row label={`Returns (${report.returnCount})`} value={report.returns} less />
        <Subtotal label="Net sales" value={report.netSales} />
        <Row label="Cost of goods sold" value={report.cogs} less />
        <Subtotal label="Trading profit" value={report.tradingProfit} />

        <Section>Services</Section>
        <Row label={`Service sales (${report.serviceCount})`} value={report.serviceRevenue} />
        <Row label="Service staff incentives" value={report.serviceIncentive} less />
        <Subtotal label="Service profit" value={report.serviceProfit} />

        <Section>Running costs</Section>
        <Row label="Product staff incentives" value={report.productIncentive} less />
        <Row label={`Expenses (${report.expenseCount})`} value={report.expenses} less />

        <tr className="break-inside-avoid text-sm font-bold">
          <td className="border-y-2 border-slate-800 px-2 py-2">{report.netProfit >= 0 ? "Net Profit" : "Net Loss"}</td>
          <td className="whitespace-nowrap border-y-2 border-slate-800 px-2 py-2 text-right tabular-nums">{formatTaka(report.netProfit)}</td>
        </tr>
      </tbody>
    </table>
    <p>
      <span className="font-semibold">In words:</span> {takaInWords(report.netProfit)}
    </p>

    {report.expenseByCategory.length > 0 && (
      <table className="w-full break-inside-avoid">
        <thead>
          <tr>
            <th className={printHead}>Expense</th>
            <th className={printHeadRight}>Share</th>
            <th className={printHeadRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {report.expenseByCategory.map((row) => (
            <tr key={row.category}>
              <td className={printCell}>{EXPENSE_LABELS[row.category] ?? row.category}</td>
              <td className={printMoney}>{percentOf(row.amount, report.expenses)}%</td>
              <td className={printMoney}>{formatTaka(row.amount)}</td>
            </tr>
          ))}
          <tr>
            <td className={printTotal} colSpan={2}>
              Total
            </td>
            <td className={`${printTotal} whitespace-nowrap text-right tabular-nums`}>{formatTaka(report.expenses)}</td>
          </tr>
        </tbody>
      </table>
    )}

    {(report.delivery > 0 || report.exchangeValue > 0) && (
      <p className="text-[10px] text-slate-600">
        Not counted as profit or cost: delivery charges collected {formatTaka(report.delivery)}, old devices taken in as stock{" "}
        {formatTaka(report.exchangeValue)}.
      </p>
    )}
  </ReportPrintShell>
);

export default ProfitLossPrint;
