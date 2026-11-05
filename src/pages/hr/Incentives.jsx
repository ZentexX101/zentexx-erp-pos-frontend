import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Badge from "../../components/common/data/Badge";
import PageHeader from "../../components/common/layout/PageHeader";
import HrStat from "../../components/hr/HrStat";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import PersonCell from "../../components/hr/PersonCell";
import PersonLink from "../../components/hr/PersonLink";
import { useIncentivesData } from "../../hooks/useHrApi";
import { percentOf } from "../../utils/chart";
import { currentMonth } from "../../utils/hr";
import { formatTaka } from "../../utils/money";

// Who earned what in the month, from their own sales and service sales. It's paid with their salary.
const Incentives = () => {
  // all states
  const [month, setMonth] = useState(currentMonth());

  // call hr api
  const { data, isLoading, error } = useIncentivesData(month);
  const s = data?.summary;
  const top = data?.rows[0]?.total ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        tools={<ExportPdfButton report={pdfReports.incentives()} params={{}} />}
        title="Incentive"
        subtitle="Earned from each sale and service sale. Paid with the month's salary."
        actions={<MonthSwitcher month={month} onChange={setMonth} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HrStat label="Total earned" value={formatTaka(s?.total ?? 0)} />
        <HrStat label="From sales" value={formatTaka(s?.sales ?? 0)} />
        <HrStat label="From services" value={formatTaka(s?.services ?? 0)} />
        <HrStat label="Paid" value={formatTaka(s?.paid ?? 0)} tone="text-emerald-600" />
      </div>

      <Alert>{error?.message}</Alert>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-48 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : data?.rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No staff in this branch yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data?.rows.map((row) => (
              <li key={row.user._id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                <div className="min-w-0 sm:w-56 sm:shrink-0">{row.onStaff ? <PersonLink person={row.user} /> : <PersonCell person={row.user} />}</div>
                <div className="min-w-0 flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.total ? Math.max(percentOf(row.total, top), 2) : 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.orders} order{row.orders === 1 ? "" : "s"} {formatTaka(row.sales)} · {row.serviceCount} service{row.serviceCount === 1 ? "" : "s"}{" "}
                    {formatTaka(row.services)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <span className="font-semibold tabular-nums text-slate-900">{formatTaka(row.total)}</span>
                  {!row.onStaff ? (
                    <Badge dot tone="outline">
                      Not on staff
                    </Badge>
                  ) : row.paid ? (
                    <Badge dot tone="green">
                      Paid
                    </Badge>
                  ) : row.total > 0 ? (
                    <Badge dot tone="amber">
                      With salary
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Incentives;
