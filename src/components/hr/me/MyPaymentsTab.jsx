import { Fragment, useState } from "react";
import { LuArrowRight, LuChevronDown, LuGift, LuHandCoins, LuPrinter, LuSparkles, LuWallet } from "react-icons/lu";
import { useMyMoneyData, useMyPayslipsData } from "../../../hooks/useHrApi";
import { formatDateTime } from "../../../utils/formatDate";
import { monthLabel } from "../../../utils/hr";
import { formatTaka } from "../../../utils/money";
import Pagination from "../../common/data/Pagination";
import HrStat from "../HrStat";

const money = "whitespace-nowrap px-3 py-3 text-right tabular-nums sm:px-4";
const head = "whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4";
// The breakdown columns: from lg only (phones and tablets open a row to see them)
const wide = "hidden lg:table-cell";

// One line of a slip's breakdown under its row (phones / tablets)
const Line = ({ label, children, strong }) => (
  <div className={`flex items-center justify-between gap-3 py-1 ${strong ? "border-t border-slate-200 pt-2 font-bold text-slate-900" : "text-slate-600"}`}>
    <span>{label}</span>
    <span className="tabular-nums">{children}</span>
  </div>
);

// Shows a deduction in red, and a dash when there's nothing
const Minus = ({ value }) => (value > 0 ? <span className="text-red-600">− {formatTaka(value)}</span> : <span className="text-slate-300">—</span>);
const Plus = ({ value }) => (value > 0 ? formatTaka(value) : <span className="text-slate-300">—</span>);

// Everything a person was paid: each month's slip in full, their advance account and their salary changes
const MyPaymentsTab = ({ staffId, onPrint }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  // Phones / tablets: the slip whose breakdown is open
  const [openSlip, setOpenSlip] = useState(null);
  const { data, isLoading } = useMyPayslipsData({ page, limit }, staffId);
  const { data: more } = useMyMoneyData(staffId);
  const s = data?.meta?.summary;
  const slips = data?.data ?? [];
  const advances = more?.advances;
  const increments = more?.increments ?? [];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
        <h2 className="border-b border-slate-100 px-4 py-3.5 font-semibold text-slate-900 sm:px-5">Salaries</h2>
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : slips.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No salary paid yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm lg:min-w-[980px]">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-full whitespace-nowrap px-3 py-3 font-semibold sm:px-5 lg:w-auto">Month</th>
                  <th className={`${head} ${wide}`}>Salary</th>
                  <th className={`${head} ${wide}`}>Absence</th>
                  <th className={`${head} ${wide}`}>Bonus</th>
                  <th className={`${head} ${wide}`}>Other cut</th>
                  <th className={`${head} ${wide}`}>Incentive</th>
                  <th className={`${head} ${wide}`}>Advance</th>
                  <th className={head}>Received</th>
                  <th className={`px-3 py-3 font-semibold sm:px-4 ${wide}`}>Paid</th>
                  <th className="px-3 py-3 sm:px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slips.map((slip) => {
                  const open = openSlip === slip._id;
                  const methods = slip.payments.map((line) => line.paymentMethod?.name ?? "—").join(", ");
                  return (
                    <Fragment key={slip._id}>
                      <tr
                        onClick={() => setOpenSlip(open ? null : slip._id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50/60 lg:cursor-default ${open ? "bg-slate-50 max-lg:[&>td]:border-b-0" : ""}`}
                      >
                        <td className="px-3 py-3 sm:px-5">
                          <span className="block font-medium text-slate-900">{monthLabel(slip.month)}</span>
                          <span className="block font-mono text-xs text-slate-500">{slip.slipNo}</span>
                          {/* Below lg the Paid column is hidden, so the date sits here */}
                          <span className="block text-xs text-slate-500 lg:hidden">Paid {formatDateTime(slip.date)}</span>
                        </td>
                        <td className={`${money} ${wide}`}>{formatTaka(slip.basic)}</td>
                        <td className={`${money} ${wide}`} title={`${slip.absentDays} days`}>
                          <Minus value={slip.absentDeduction} />
                        </td>
                        <td className={`${money} ${wide}`}>
                          <Plus value={slip.bonus} />
                        </td>
                        <td className={`${money} ${wide}`}>
                          <Minus value={slip.otherDeduction} />
                        </td>
                        <td className={`${money} ${wide}`}>
                          <Plus value={slip.incentive} />
                        </td>
                        <td className={`${money} ${wide}`}>
                          <Minus value={slip.advanceDeducted} />
                        </td>
                        <td className={`${money} text-base font-bold text-slate-900 lg:text-sm`}>{formatTaka(slip.netPaid)}</td>
                        <td className={`whitespace-nowrap px-3 py-3 text-slate-500 sm:px-4 ${wide}`}>
                          <span className="block">{formatDateTime(slip.date)}</span>
                          <span className="block text-xs">{methods}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right sm:px-4">
                          {/* lg: print right in the row. Below lg: one big open / close button (print is in the breakdown) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrint(slip);
                            }}
                            aria-label="Print slip"
                            title="Print slip"
                            className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
                          >
                            <LuPrinter className="size-4" aria-hidden="true" />
                          </button>
                          <span
                            className={`inline-flex size-8 items-center justify-center rounded-full ring-1 ring-inset transition lg:hidden ${
                              open ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-500 ring-slate-200"
                            }`}
                            aria-label={open ? "Hide breakdown" : "Show breakdown"}
                          >
                            <LuChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                          </span>
                        </td>
                      </tr>
                      {open && (
                        <tr className="!border-t-0 bg-slate-50 lg:hidden">
                          <td colSpan={3} className="px-3 pb-3 sm:px-5">
                            <div className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                              <Line label="Salary">{formatTaka(slip.basic)}</Line>
                              <Line label={`Absence${slip.absentDays ? ` (${slip.absentDays} days)` : ""}`}>
                                <Minus value={slip.absentDeduction} />
                              </Line>
                              <Line label="Bonus">
                                <Plus value={slip.bonus} />
                              </Line>
                              <Line label="Other cut">
                                <Minus value={slip.otherDeduction} />
                              </Line>
                              <Line label="Incentive">
                                <Plus value={slip.incentive} />
                              </Line>
                              <Line label="Advance cut">
                                <Minus value={slip.advanceDeducted} />
                              </Line>
                              <Line label="Received" strong>
                                {formatTaka(slip.netPaid)}
                              </Line>
                              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pb-1 pt-2.5">
                                <p className="min-w-0 text-xs text-slate-500">Paid by {methods}</p>
                                <button
                                  type="button"
                                  onClick={() => onPrint(slip)}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                                >
                                  <LuPrinter className="size-3.5" aria-hidden="true" />
                                  Print slip
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
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
          <h2 className="border-b border-slate-100 px-4 py-3.5 font-semibold text-slate-900 sm:px-5">Advance account</h2>
          {!advances?.lines.length ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No advance taken.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="hidden px-3 py-3 font-semibold sm:table-cell sm:px-5">Date</th>
                    <th className="px-3 py-3 font-semibold sm:px-4">What</th>
                    <th className={head}>Amount</th>
                    <th className={head}>To return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...advances.lines].reverse().map((line) => (
                    <tr key={`${line.no}-${line.type}`}>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-slate-600 sm:table-cell sm:px-5">{formatDateTime(line.date)}</td>
                      <td className="px-3 py-3 sm:px-4">
                        <span className="block font-medium text-slate-800">
                          {line.type === "given" ? "Advance taken" : `Cut from ${monthLabel(line.month)} salary`}
                        </span>
                        <span className="block text-xs text-slate-500">
                          <span className="font-mono">{line.no}</span>
                          {/* Phones: the Date column is hidden, so the date sits here */}
                          <span className="block whitespace-nowrap sm:hidden">{formatDateTime(line.date)}</span>
                        </span>
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
          <h2 className="border-b border-slate-100 px-4 py-3.5 font-semibold text-slate-900 sm:px-5">Salary changes</h2>
          {increments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No change yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {increments.map((row) => (
                <li key={row._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm sm:px-5">
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
