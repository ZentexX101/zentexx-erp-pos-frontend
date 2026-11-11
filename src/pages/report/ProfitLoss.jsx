import { useState } from "react";
import { LuArrowDownRight, LuArrowUpRight, LuInfo } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import ProfitLossPrint from "../../components/report/ProfitLossPrint";
import ProfitStatement from "../../components/report/ProfitStatement";
import ProfitVerdict from "../../components/report/ProfitVerdict";
import ReportHeader from "../../components/report/ReportHeader";
import { EXPENSE_LABELS } from "../../constants/report";
import { useAuth } from "../../hooks/useAuth";
import { useCardLink } from "../../hooks/useCardLink";
import { useProfitLossData, useReportScope } from "../../hooks/useReportApi";
import { hasPermission } from "../../utils/access";
import { percentOf } from "../../utils/chart";
import { formatTaka } from "../../utils/money";
import { periodRange, rangeText } from "../../utils/period";

// One headline number with its change from the period before. lowerIsBetter: costs going up is bad news.
const Kpi = ({ label, value, before, lowerIsBetter }) => {
  const known = before !== undefined && before !== 0;
  const change = known ? Math.round(((value - before) / Math.abs(before)) * 100) : 0;
  const good = lowerIsBetter ? change < 0 : change > 0;
  const Arrow = change > 0 ? LuArrowUpRight : LuArrowDownRight;

  return (
    <div className="min-w-0 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80 sm:p-4 print:shadow-none">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{label}</p>
      {/* Two cards a row on phones: a smaller number that wraps (never cut) when it's in crores */}
      <p
        className={`mt-1 break-all text-base font-bold tabular-nums sm:truncate sm:text-xl ${value < 0 ? "text-red-600" : "text-slate-900"}`}
        title={formatTaka(value)}
      >
        {formatTaka(value)}
      </p>
      {before !== undefined && (
        <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1 text-xs text-slate-500 sm:flex-nowrap">
          {known && change !== 0 ? (
            <span className={`inline-flex shrink-0 items-center font-semibold tabular-nums ${good ? "text-emerald-600" : "text-red-600"}`}>
              <Arrow className="size-3.5" aria-hidden="true" />
              {Math.abs(change)}%
            </span>
          ) : null}
          <span className="truncate">{known && change === 0 ? "Same as before" : `Before: ${formatTaka(before)}`}</span>
        </p>
      )}
    </div>
  );
};

// Profit & Loss: the answer first, then the numbers behind it. Serves both panels (useReportScope).
const ProfitLoss = () => {
  const { user } = useAuth();
  const scope = useReportScope();

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });

  // call report api (everything is worked out on the backend)
  const range = periodRange(period.period, period);
  const { data: report, isLoading, isFetching, error, refetch } = useProfitLossData({ branch: scope.branch, ...range });
  const linkTo = useCardLink({ inBranch: scope.inBranch, branch: scope.pickedBranch });
  const before = report?.previous;

  return (
    <>
      <div className="space-y-5 print:hidden">
        <ReportHeader
          title="Profit & Loss"
          subtitle="What was earned, what it cost, and what was left"
          scope={scope}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRefresh={refetch}
          refreshing={isFetching}
          canExport={hasPermission(user, "report.export")}
        />

        <Alert>{error?.message}</Alert>

        {isLoading && !report ? (
          <div className="space-y-5" aria-hidden="true">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
          </div>
        ) : (
          report && (
            <>
              <ProfitVerdict report={report} />

              <div>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <Kpi label="Net sales" value={report.netSales} before={before?.netSales} />
                  <Kpi label="Trading profit" value={report.tradingProfit} before={before?.tradingProfit} />
                  <Kpi label="Service profit" value={report.serviceProfit} before={before?.serviceProfit} />
                  <Kpi label="Expenses" value={report.expenses} before={before?.expenses} lowerIsBetter />
                </div>
                {before && (
                  <p className="mt-2 text-xs text-slate-500">
                    Compared with the {before.days === 1 ? "day" : `${before.days} days`} before: {rangeText(before)}
                  </p>
                )}
              </div>

              <div className="grid items-start gap-4 xl:grid-cols-[3fr_2fr]">
                <ProfitStatement report={report} linkTo={linkTo} />

                <div className="min-w-0 space-y-4">
                  <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5 print:shadow-none">
                    <h2 className="font-semibold text-slate-900">Where expenses went</h2>
                    {report.expenseByCategory.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-400">No expense in this period.</p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {report.expenseByCategory.map((row) => (
                          <li key={row.category}>
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate text-slate-700">{EXPENSE_LABELS[row.category] ?? row.category}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-slate-500"
                                  style={{ width: `${Math.max(percentOf(row.amount, report.expenses), 2)}%` }}
                                />
                              </div>
                              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">{percentOf(row.amount, report.expenses)}%</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {(report.delivery > 0 || report.exchangeValue > 0) && (
                    <section className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/80 sm:p-5">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <LuInfo className="size-4 text-slate-500" aria-hidden="true" />
                        Not counted as profit or cost
                      </h2>
                      <dl className="mt-3 space-y-2 text-sm">
                        {report.delivery > 0 && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-600">Delivery charges collected</dt>
                            <dd className="font-semibold tabular-nums text-slate-900">{formatTaka(report.delivery)}</dd>
                          </div>
                        )}
                        {report.exchangeValue > 0 && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-600">Old devices taken in (now stock)</dt>
                            <dd className="font-semibold tabular-nums text-slate-900">{formatTaka(report.exchangeValue)}</dd>
                          </div>
                        )}
                      </dl>
                    </section>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </div>

      {report && <ProfitLossPrint report={report} branchName={scope.branchName} range={range} />}
    </>
  );
};

export default ProfitLoss;
