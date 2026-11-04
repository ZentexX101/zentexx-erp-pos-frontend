import { useState } from "react";
import { LuGift, LuReceipt, LuWallet } from "react-icons/lu";
import { useMyIncentivesData } from "../../../hooks/useHrApi";
import { formatDateTime } from "../../../utils/formatDate";
import { currentMonth, monthLabel } from "../../../utils/hr";
import { formatTaka } from "../../../utils/money";
import Badge from "../../common/data/Badge";
import MonthSwitcher from "../MonthSwitcher";
import HrStat from "../HrStat";

const TYPE = {
  sale: { label: "Sale", tone: "blue" },
  exchange: { label: "Exchange", tone: "purple" },
  service: { label: "Service", tone: "green" },
};

// What a person earned in a month, order by order, and whether it has been paid with their salary
const MyIncentiveTab = ({ staffId }) => {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useMyIncentivesData(month, staffId);
  const lines = data?.lines ?? [];

  return (
    <>
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <HrStat label="Earned" value={formatTaka(data?.total ?? 0)} tone="text-emerald-600" hint={monthLabel(month)} icon={LuGift} accent="green" />
        <HrStat label="Orders" value={lines.length} icon={LuReceipt} accent="blue" />
        <HrStat
          label="Paid"
          value={data?.paid ? "With salary" : "Not yet"}
          hint={data?.paid ? data.paid.slipNo : "Comes with the month's salary"}
          icon={LuWallet}
          accent={data?.paid ? "green" : "slate"}
        />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : lines.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No incentive in this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">No.</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 text-right font-semibold">Incentive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line) => (
                  <tr key={line.no} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDateTime(line.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-900">{line.no}</td>
                    <td className="px-4 py-3">
                      <Badge dot tone={TYPE[line.type].tone}>
                        {TYPE[line.type].label}
                      </Badge>
                    </td>
                    <td className="max-w-72 truncate px-4 py-3 text-slate-700" title={line.detail}>
                      {line.detail}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-emerald-700">{formatTaka(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                <tr>
                  <td colSpan={4} className="px-5 py-3">
                    Total
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatTaka(data.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default MyIncentiveTab;
