import { LuHistory, LuPencilLine } from "react-icons/lu";
import { monthLabel } from "../../../utils/hr";
import { changeText, changeTone } from "../../../utils/increment";
import { formatTaka } from "../../../utils/money";
import PersonLink from "../PersonLink";

// Every staff member with today's salary, their last change and any upcoming one.
// onHistory(userId), onChange(userId) (only when the viewer can change salaries).
const SalaryStaffList = ({ rows, isLoading, onHistory, onChange }) => {
  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />;
  if (!rows.length) {
    return <p className="rounded-2xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/70">No staff found.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_auto] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
        <span>Staff</span>
        <span>Salary now</span>
        <span>Last change</span>
        <span>Since joining</span>
        <span className="w-44 text-right">Actions</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => (
          <li
            key={row.user._id}
            className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_auto] lg:items-center lg:gap-4"
          >
            <div className="min-w-0">
              <PersonLink person={row.user} />
            </div>

            <div>
              <p className="text-xs text-slate-500 lg:hidden">Salary now</p>
              <p className="text-base font-bold tabular-nums text-slate-900">{formatTaka(row.current)}</p>
              {row.upcoming && (
                <p className="mt-0.5 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100">
                  {formatTaka(row.upcoming.newSalary)} from {monthLabel(row.upcoming.effectiveMonth)}
                </p>
              )}
            </div>

            <div className="min-w-0 text-sm">
              <p className="text-xs text-slate-500 lg:hidden">Last change</p>
              {row.last ? (
                <>
                  <p className={`font-semibold tabular-nums ${changeTone(row.last.difference)}`}>{changeText(row.last.difference, row.last.percent)}</p>
                  <p className="truncate text-xs text-slate-500" title={row.last.reason ?? ""}>
                    {monthLabel(row.last.effectiveMonth)}
                    {row.last.reason ? ` · ${row.last.reason}` : ""}
                  </p>
                </>
              ) : (
                <p className="text-slate-400">No change yet</p>
              )}
            </div>

            <div className="text-sm">
              <p className="text-xs text-slate-500 lg:hidden">Since joining</p>
              <p className={`font-semibold tabular-nums ${changeTone(row.totalRaise)}`}>{row.totalRaise ? changeText(row.totalRaise) : "—"}</p>
              <p className="text-xs text-slate-500">
                {row.changes} change{row.changes === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex gap-2 lg:w-44 lg:justify-end">
              <button
                type="button"
                onClick={() => onHistory(row.user._id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <LuHistory className="size-3.5" aria-hidden="true" />
                History
              </button>
              {onChange && (
                <button
                  type="button"
                  onClick={() => onChange(row.user._id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
                >
                  <LuPencilLine className="size-3.5" aria-hidden="true" />
                  Change
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SalaryStaffList;
