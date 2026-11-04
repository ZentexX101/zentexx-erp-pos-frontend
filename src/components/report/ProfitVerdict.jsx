import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { formatTaka, takaInWords } from "../../utils/money";

// The answer first: did the business make money in this period, and how much of each ৳100 stayed
const ProfitVerdict = ({ report }) => {
  const made = report.netProfit >= 0;
  const Icon = made ? LuTrendingUp : LuTrendingDown;
  const nothing = !report.income && !report.expenses;

  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl p-5 ring-1 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${made ? "bg-emerald-50 ring-emerald-200" : "bg-red-50 ring-red-200"}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ${made ? "text-emerald-600" : "text-red-600"}`}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${made ? "text-emerald-800" : "text-red-800"}`}>{made ? "Net Profit" : "Net Loss"}</p>
          <p className={`truncate text-3xl font-bold tracking-tight tabular-nums ${made ? "text-emerald-700" : "text-red-700"}`}>
            {formatTaka(report.netProfit)}
          </p>
          <p className={`truncate text-sm ${made ? "text-emerald-800/80" : "text-red-800/80"}`} title={takaInWords(report.netProfit)}>
            {takaInWords(report.netProfit)}
          </p>
        </div>
      </div>
      <p className={`max-w-sm text-sm sm:text-right ${made ? "text-emerald-900" : "text-red-900"}`}>
        {nothing ? (
          "Nothing was sold or spent in this period."
        ) : report.income > 0 ? (
          <>
            {made ? "Kept" : "Lost"} <span className="font-bold">{formatTaka(Math.abs(report.margin))}</span> of every ৳100 earned, from{" "}
            {formatTaka(report.income)} of sales, services and repairs.
          </>
        ) : (
          "Only costs in this period, with no sales, services or repairs."
        )}
      </p>
    </section>
  );
};

export default ProfitVerdict;
