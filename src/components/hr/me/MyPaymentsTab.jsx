import { useState } from "react";
import { LuArrowRight, LuGift, LuHandCoins, LuPrinter, LuSparkles, LuWallet } from "react-icons/lu";
import { useMyMoneyData, useMyPayslipsData } from "../../../hooks/useHrApi";
import { formatDateTime } from "../../../utils/formatDate";
import { monthLabel } from "../../../utils/hr";
import { formatTaka } from "../../../utils/money";
import Pagination from "../../common/data/Pagination";
import HrStat from "../HrStat";

const money = "whitespace-nowrap px-4 py-3 text-right tabular-nums";
const head = "px-4 py-3 text-right font-semibold";

// Shows a deduction in red, and a dash when there's nothing
const Minus = ({ value }) => (value > 0 ? <span className="text-red-600">− {formatTaka(value)}</span> : <span className="text-slate-300">—</span>);
const Plus = ({ value }) => (value > 0 ? formatTaka(value) : <span className="text-slate-300">—</span>);

// Everything a person was paid: each month's slip in full, their advance account and their salary changes
const MyPaymentsTab = ({ staffId, onPrint }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const { data, isLoading } = useMyPayslipsData({ page, limit }, staffId);
  const { data: more } = useMyMoneyData(staffId);
  const s = data?.meta?.summary;
  const slips = data?.data ?? [];
  const advances = more?.advances;
  const increments = more?.increments ?? [];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HrStat
          label="Received in all"
          value={formatTaka(s?.paid ?? 0)}
          tone="text-emerald-600"
          hint={`${s?.count ?? 0} ${s?.count === 1 ? "salary" : "salaries"}`}
          icon={LuWallet}
          accent="green"
        />
        <HrStat label="Incentive received" value={formatTaka(s?.incentive ?? 0)} icon={LuGift} accent="blue" />
        <HrStat label="Bonus received" value={formatTaka(s?.bonus ?? 0)} icon={LuSparkles} accent="purple" />
        <HrStat
          label="Advance to return"
          value={formatTaka(advances?.balance ?? 0)}
          tone={advances?.balance ? "text-amber-700" : "text-slate-900"}
          icon={LuHandCoins}
          accent="amber"
        />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <h2 className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-900">Salaries</h2>
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : slips.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No salary paid yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Month</th>
                  <th className={head}>Salary</th>
                  <th className={head}>Absence</th>
                  <th className={head}>Bonus</th>
                  <th className={head}>Other cut</th>
                  <th className={head}>Incentive</th>
                  <th className={head}>Advance</th>
                  <th className={head}>Received</th>
                  <th className="px-4 py-3 font-semibold">Paid</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slips.map((slip) => (
                  <tr key={slip._id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="block font-medium text-slate-900">{monthLabel(slip.month)}</span>
                      <span className="block font-mono text-xs text-slate-500">{slip.slipNo}</span>
                    </td>
                    <td className={money}>{formatTaka(slip.basic)}</td>
                    <td className={money} title={`${slip.absentDays} days`}>
                      <Minus value={slip.absentDeduction} />
                    </td>
                    <td className={money}>
                      <Plus value={slip.bonus} />
                    </td>
                    <td className={money}>
                      <Minus value={slip.otherDeduction} />
                    </td>
                    <td className={money}>
                      <Plus value={slip.incentive} />
                    </td>
                    <td className={money}>
                      <Minus value={slip.advanceDeducted} />
                    </td>
                    <td className={`${money} font-bold text-slate-900`}>{formatTaka(slip.netPaid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      <span className="block">{formatDateTime(slip.date)}</span>
                      <span className="block text-xs">{slip.payments.map((line) => line.paymentMethod?.name ?? "—").join(", ")}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onPrint(slip)}
                        aria-label="Print slip"
                        title="Print slip"
                        className="rounded p-1 text-slate-400 hover:text-slate-900"
                      >
                        <LuPrinter className="size-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pagination
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <h2 className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-900">Advance account</h2>
          {!advances?.lines.length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No advance taken.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">What</th>
                    <th className={head}>Amount</th>
                    <th className={head}>To return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...advances.lines].reverse().map((line) => (
                    <tr key={`${line.no}-${line.type}`}>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(line.date)}</td>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-slate-800">
                          {line.type === "given" ? "Advance taken" : `Cut from ${monthLabel(line.month)} salary`}
                        </span>
                        <span className="block font-mono text-xs text-slate-500">{line.no}</span>
                      </td>
                      <td className={money}>
                        {line.type === "given" ? (
                          <span className="text-amber-700">+ {formatTaka(line.amount)}</span>
                        ) : (
                          <span className="text-emerald-700">− {formatTaka(line.amount)}</span>
                        )}
                      </td>
                      <td className={`${money} font-semibold text-slate-900`}>{formatTaka(line.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <h2 className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-900">Salary changes</h2>
          {increments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No change yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {increments.map((row) => (
                <li key={row._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 font-medium tabular-nums text-slate-800">
                      {formatTaka(row.oldSalary)}
                      <LuArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-semibold text-slate-900">{formatTaka(row.newSalary)}</span>
                    </span>
                    {row.reason && <span className="block truncate text-xs text-slate-500">{row.reason}</span>}
                  </span>
                  <span className="shrink-0 text-slate-500">From {monthLabel(row.effectiveMonth)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default MyPaymentsTab;
