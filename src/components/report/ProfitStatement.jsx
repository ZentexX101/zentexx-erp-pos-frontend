import { LuArrowUpRight } from "react-icons/lu";
import { Link } from "react-router";
import { formatTaka } from "../../utils/money";

// One line. less: a deduction, shown with a minus. link: { to, onClick } opens the page behind the number.
const Line = ({ label, hint, value, less, link }) => (
  <div className="group flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
    <span className={`min-w-0 ${less ? "pl-4 text-slate-500" : "font-medium text-slate-800"}`}>
      {link ? (
        <Link to={link.to} onClick={link.onClick} className="inline-flex items-center gap-1 hover:text-slate-900 hover:underline print:no-underline">
          {label}
          <LuArrowUpRight className="size-3.5 text-slate-300 group-hover:text-slate-600 print:hidden" aria-hidden="true" />
        </Link>
      ) : (
        label
      )}
      {hint && <span className="ml-1.5 text-xs text-slate-400">{hint}</span>}
    </span>
    <span className={`shrink-0 tabular-nums ${less ? "text-red-600" : "font-medium text-slate-900"}`}>
      {less && value > 0 ? "− " : ""}
      {formatTaka(value)}
    </span>
  </div>
);

// A running total at the end of a section
const Subtotal = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-y border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900">
    <span className="min-w-0">{label}</span>
    <span className={`shrink-0 tabular-nums ${value < 0 ? "text-red-600" : ""}`}>{formatTaka(value)}</span>
  </div>
);

const Heading = ({ children }) => <h3 className="px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{children}</h3>;

// The statement top to bottom: each section ends in a running total, down to the net profit.
// linkTo(key): the page behind a number, when this user can open one.
const ProfitStatement = ({ report, linkTo }) => (
  <section className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 print:shadow-none">
    <h2 className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-900">Statement</h2>

    <Heading>Product sales</Heading>
    <Line label="Sales" hint={`${report.orders} order${report.orders === 1 ? "" : "s"}`} value={report.revenue} link={linkTo("sales")} />
    <Line label="Discounts" value={report.discount} less />
    <Line label="Returns" hint={`${report.returnCount} return${report.returnCount === 1 ? "" : "s"}`} value={report.returns} less link={linkTo("posReturns")} />
    <Subtotal label="Net sales" value={report.netSales} />
    <Line label="Cost of goods sold" hint="returned pieces excluded" value={report.cogs} less />
    <Subtotal label="Trading profit" value={report.tradingProfit} />

    <Heading>Services</Heading>
    <Line label="Service sales" hint={`${report.serviceCount} sold`} value={report.serviceRevenue} link={linkTo("serviceSales")} />
    <Line label="Service staff incentives" value={report.serviceIncentive} less />
    <Subtotal label="Service profit" value={report.serviceProfit} />

    <Heading>Repairs</Heading>
    <Line label="Repair charges" hint={`${report.repairCount} job${report.repairCount === 1 ? "" : "s"} closed`} value={report.repairRevenue} link={linkTo("repairs")} />
    <Line label="Parts and outside work" value={report.repairCost} less />
    <Subtotal label="Repair profit" value={report.repairProfit} />

    <Heading>Running costs</Heading>
    <Line label="Replacements" hint={`${report.replacementCount} done, after charges and pieces restocked`} value={report.replacements} less />
    <Line label="Product staff incentives" value={report.productIncentive} less />
    <Line label="Salaries" hint={`${report.salaryCount} paid`} value={report.salaries} less />
    <Line
      label="Expenses"
      hint={`${report.expenseCount} expense${report.expenseCount === 1 ? "" : "s"}`}
      value={report.expenses}
      less
      link={linkTo("expenses")}
    />

    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 font-bold ${report.netProfit >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
    >
      <span>{report.netProfit >= 0 ? "Net Profit" : "Net Loss"}</span>
      <span className="text-lg tabular-nums">{formatTaka(report.netProfit)}</span>
    </div>
  </section>
);

export default ProfitStatement;
