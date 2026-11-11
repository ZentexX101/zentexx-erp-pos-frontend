import { useState } from "react";
import { LuInfo } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import AccountBalances from "../../components/report/AccountBalances";
import CashFlowCard from "../../components/report/CashFlowCard";
import DailyStatementPrint from "../../components/report/DailyStatementPrint";
import ReportHeader from "../../components/report/ReportHeader";
import { useAuth } from "../../hooks/useAuth";
import { useDailyStatementData, useReportScope } from "../../hooks/useReportApi";
import { hasPermission } from "../../utils/access";
import { formatTaka, takaInWords } from "../../utils/money";
import { periodRange } from "../../utils/period";

// One step of "opening + in − out = closing"; sign sits between the boxes
const Step = ({ sign, label, value, tone = "text-slate-900", strong }) => (
  <div className="relative min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 print:shadow-none">
    {sign && (
      <span
        className="absolute -left-3.5 top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 lg:flex"
        aria-hidden="true"
      >
        {sign}
      </span>
    )}
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 truncate font-bold tabular-nums ${strong ? "text-2xl" : "text-xl"} ${tone}`} title={formatTaka(value)}>
      {formatTaka(value)}
    </p>
  </div>
);

// The same step as one line of the phone summary card
const PhoneStep = ({ sign, label, value, tone = "text-slate-900" }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3">
    <dt className="text-slate-600">
      <span className="mr-2 inline-block w-3 text-slate-400">{sign}</span>
      {label}
    </dt>
    <dd className={`break-all text-right font-semibold tabular-nums ${tone}`}>{formatTaka(value)}</dd>
  </div>
);

// Daily Statement: every taka that moved through the payment methods in the period (from their ledger),
// so it always matches the real balances. Serves the branch panel and the main panel (useReportScope).
const DailyStatement = () => {
  const { user } = useAuth();
  const scope = useReportScope();

  // all states
  const [period, setPeriod] = useState({ period: "today", from: "", to: "" });

  // call report api (everything is worked out on the backend)
  const range = periodRange(period.period, period);
  const { data, isLoading, isFetching, error, refetch } = useDailyStatementData({ branch: scope.branch, ...range });
  const summary = data?.summary;
  const hasDue = data && (data.notCash.saleDue > 0 || data.notCash.purchaseDue > 0);

  return (
    <>
      <div className="space-y-5 print:hidden">
        <ReportHeader
          title="Daily Statement"
          subtitle="Where the money came from and where it went"
          scope={scope}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRefresh={refetch}
          refreshing={isFetching}
          canExport={hasPermission(user, "report.export")}
        />

        <Alert>{error?.message}</Alert>

        {isLoading && !data ? (
          <div className="space-y-5" aria-hidden="true">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
            </div>
          </div>
        ) : (
          data && (
            <>
              {/* Phones: the sum as one card, each step a line */}
              <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 sm:hidden">
                <dl className="divide-y divide-slate-100 text-sm">
                  <PhoneStep label="Opening balance" value={summary.opening} />
                  <PhoneStep sign="+" label="Money in" value={summary.inflow} tone="text-emerald-600" />
                  <PhoneStep sign="−" label="Money out" value={summary.outflow} tone="text-red-600" />
                  <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3.5">
                    <dt className="font-semibold text-slate-900">
                      <span className="mr-2 inline-block w-3 text-slate-400">=</span>Closing balance
                    </dt>
                    <dd className="break-all text-right text-lg font-bold tabular-nums text-slate-900">{formatTaka(summary.closing)}</dd>
                  </div>
                </dl>
              </section>

              <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                <Step label="Opening balance" value={summary.opening} />
                <Step sign="+" label="Money in" value={summary.inflow} tone="text-emerald-600" />
                <Step sign="−" label="Money out" value={summary.outflow} tone="text-red-600" />
                <Step sign="=" label="Closing balance" value={summary.closing} strong />
              </div>
              <p className="-mt-2 text-sm text-slate-500 xl:truncate" title={takaInWords(summary.closing)}>
                Closing: <span className="font-medium text-slate-700">{takaInWords(summary.closing)}</span>
                <span className={`block font-semibold tabular-nums xl:ml-3 xl:inline ${summary.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {summary.net >= 0 ? "+" : ""}
                  {formatTaka(summary.net)} this period
                </span>
              </p>

              <div className="grid items-stretch gap-4 lg:grid-cols-2">
                <CashFlowCard title="Money In" tone="in" rows={data.inflows} total={summary.inflow} emptyText="No money came in during this period." />
                <CashFlowCard title="Money Out" tone="out" rows={data.outflows} total={summary.outflow} emptyText="No money went out during this period." />
              </div>

              {hasDue && (
                <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <LuInfo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    No cash moved for these, so they aren't counted above:
                    {data.notCash.saleDue > 0 && (
                      <>
                        {" "}
                        sold on due <span className="font-semibold">{formatTaka(data.notCash.saleDue)}</span>
                      </>
                    )}
                    {data.notCash.saleDue > 0 && data.notCash.purchaseDue > 0 && ","}
                    {data.notCash.purchaseDue > 0 && (
                      <>
                        {" "}
                        bought on due <span className="font-semibold">{formatTaka(data.notCash.purchaseDue)}</span>
                      </>
                    )}
                    .
                  </span>
                </p>
              )}

              <AccountBalances accounts={data.accounts} summary={summary} showBranch={scope.showBranch} linkable={scope.inBranch} />
            </>
          )
        )}
      </div>

      {data && <DailyStatementPrint data={data} branchName={scope.branchName} range={range} showBranch={scope.showBranch} />}
    </>
  );
};

export default DailyStatement;
