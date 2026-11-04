import { useCallback, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Badge from "../../components/common/data/Badge";
import PageHeader from "../../components/common/layout/PageHeader";
import HrStat from "../../components/hr/HrStat";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import PaySalaryModal from "../../components/hr/PaySalaryModal";
import PayslipPrint from "../../components/hr/PayslipPrint";
import PersonLink from "../../components/hr/PersonLink";
import { useAuth } from "../../hooks/useAuth";
import { usePayrollData, usePaySalary } from "../../hooks/useHrApi";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { hasPermission } from "../../utils/access";
import { currentMonth, monthLabel } from "../../utils/hr";
import { formatTaka } from "../../utils/money";

const money = "whitespace-nowrap px-4 py-3 text-right tabular-nums";

// Salary: everyone's month at a glance, worked out from attendance, leave, sales and advances. Pay in one click.
const Salaries = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "hr.manage");

  // all states
  const [month, setMonth] = useState(currentMonth());
  const [paying, setPaying] = useState(null);
  const [printSlip, setPrintSlip] = useState(null);

  // call hr api (everything is worked out on the backend)
  const { data, isLoading, error } = usePayrollData(month);
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const pay = usePaySalary();
  usePrintWhenReady(
    printSlip,
    useCallback(() => setPrintSlip(null), []),
  );
  const s = data?.summary;
  const midMonth = month === currentMonth();

  return (
    <div>
      <div className="space-y-5 print:hidden">
        <PageHeader
          title="Salary"
          subtitle="Worked out from attendance, leave, sales and advances"
          actions={<MonthSwitcher month={month} onChange={setMonth} />}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HrStat label="Staff" value={s?.staff ?? 0} />
          <HrStat label="Paid" value={`${s?.paidCount ?? 0} of ${s?.staff ?? 0}`} tone="text-emerald-600" />
          <HrStat label="Paid so far" value={formatTaka(s?.paid ?? 0)} />
          <HrStat label="Still to pay" value={formatTaka(s?.toPay ?? 0)} tone={s?.toPay ? "text-red-600" : "text-slate-900"} />
        </div>

        {midMonth && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {monthLabel(month)} isn't over yet. These numbers can still change, and days still to come aren't counted as absent.
          </p>
        )}
        <Alert>{error?.message}</Alert>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          {isLoading && !data ? (
            <div className="h-48 animate-pulse bg-slate-100" aria-hidden="true" />
          ) : data?.rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No staff in this branch yet. Add them from the Staff page, with their salary.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Staff</th>
                    <th className="px-4 py-3 text-right font-semibold">Salary</th>
                    <th className="px-4 py-3 text-right font-semibold">Absence</th>
                    <th className="px-4 py-3 text-right font-semibold">Incentive</th>
                    <th className="px-4 py-3 text-right font-semibold">Advance</th>
                    <th className="px-4 py-3 text-right font-semibold">To pay</th>
                    <th className="px-4 py-3 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.rows.map((row) => {
                    const slip = row.slip;
                    const noSalary = !row.basic && !row.incentive;
                    return (
                      <tr key={row.user._id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-5 py-3">
                          <PersonLink person={row.user} />
                        </td>
                        <td className={money}>{noSalary ? <span className="text-xs text-amber-700">Not set</span> : formatTaka(slip?.basic ?? row.basic)}</td>
                        <td className={money}>
                          {(slip?.absentDeduction ?? row.absentDeduction) > 0 ? (
                            <span className="text-red-600" title={row.counts ? `${row.counts.deductible} days` : undefined}>
                              − {formatTaka(slip?.absentDeduction ?? row.absentDeduction)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className={`${money} text-emerald-700`}>
                          {(slip?.incentive ?? row.incentive) > 0 ? formatTaka(slip?.incentive ?? row.incentive) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className={money}>
                          {(slip?.advanceDeducted ?? row.suggestedAdvance) > 0 ? (
                            <span className="text-amber-700">− {formatTaka(slip?.advanceDeducted ?? row.suggestedAdvance)}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className={`${money} font-semibold text-slate-900`}>
                          {formatTaka(slip ? slip.netPaid : Math.max(row.netBeforeAdvance - row.suggestedAdvance, 0))}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {slip ? (
                            <span className="inline-flex items-center gap-2">
                              <Badge dot tone="green">
                                Paid
                              </Badge>
                              <button
                                type="button"
                                onClick={() => setPrintSlip(slip)}
                                aria-label="Print slip"
                                title="Print slip"
                                className="rounded p-1 text-slate-400 hover:text-slate-900"
                              >
                                <LuPrinter className="size-4" aria-hidden="true" />
                              </button>
                            </span>
                          ) : canManage ? (
                            <Button onClick={() => setPaying(row)} disabled={noSalary}>
                              Pay
                            </Button>
                          ) : (
                            <Badge dot tone="amber">
                              Not paid
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {paying && (
          <PaySalaryModal
            row={paying}
            methods={methods}
            onClose={() => setPaying(null)}
            onPay={(values) => pay.mutateAsync(values)}
            submitting={pay.isPending}
          />
        )}
      </div>

      {printSlip && <PayslipPrint slip={printSlip} />}
    </div>
  );
};

export default Salaries;
