import { useState } from "react";
import { LuArrowRight, LuChevronDown, LuHistory } from "react-icons/lu";
import { useIncrementGroupsData } from "../../../hooks/useHrApi";
import { formatDate } from "../../../utils/formatDate";
import { monthLabel } from "../../../utils/hr";
import { changeText, changeTone } from "../../../utils/increment";
import { formatTaka } from "../../../utils/money";
import Alert from "../../common/alerts/Alert";
import Pagination from "../../common/data/Pagination";
import Input from "../../common/forms/Input";
import Select from "../../common/forms/Select";
import PersonCell from "../PersonCell";

// One person's changes by date, inside their open row (newest first)
const ChangeRows = ({ changes }) => (
  <ol className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
    {changes.map((change) => (
      <li key={change._id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[9rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-4">
        <div>
          <p className="font-medium text-slate-800">{formatDate(change.createdAt)}</p>
          <p className="text-xs text-slate-500">Set by {change.createdBy?.name ?? "—"}</p>
        </div>
        <p className="flex flex-wrap items-center gap-1.5 tabular-nums text-slate-700">
          {formatTaka(change.oldSalary)}
          <LuArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{formatTaka(change.newSalary)}</span>
          <span className={`text-xs font-semibold ${changeTone(change.difference)}`}>{changeText(change.difference, change.percent)}</span>
        </p>
        <p className="text-slate-700">
          From {monthLabel(change.effectiveMonth)}
          {change.upcoming && <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Upcoming</span>}
        </p>
        <p className="text-slate-600 [overflow-wrap:anywhere]">{change.reason || <span className="text-slate-400">No reason written</span>}</p>
      </li>
    ))}
  </ol>
);

// Salary changes, one row per staff member (whoever changed most recently first). A row opens to show that
// person's changes by date; "Full history" opens their whole timeline. Filters: staff and the month a change starts.
const IncrementLog = ({ staff, onHistory }) => {
  const [user, setUser] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(null); // user id

  const params = { user, from: from ? `${from}-01` : "", to: to ? `${to}-28` : "", page, limit };
  const { data, isLoading, error } = useIncrementGroupsData(params);
  const rows = data?.data ?? [];
  const filter = (set) => (e) => {
    set(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:grid-cols-3">
        <Select
          label="Staff"
          placeholder="All staff"
          options={staff.map((row) => ({ value: row.user._id, label: row.user.name }))}
          value={user}
          onChange={filter(setUser)}
        />
        <Input label="Starts from month" type="month" value={from} onChange={filter(setFrom)} />
        <Input label="Up to month" type="month" value={to} onChange={filter(setTo)} />
      </div>

      <Alert>{error?.message}</Alert>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No salary change for this filter.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isOpen = open === row.user._id;
              return (
                <li key={row.user._id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : row.user._id)}
                    className={`grid w-full gap-3 px-5 py-4 text-left transition sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4 ${
                      isOpen ? "bg-slate-50" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <PersonCell person={row.user} />
                    <div className="text-sm">
                      <p className="flex flex-wrap items-center gap-1.5 tabular-nums text-slate-700">
                        {formatTaka(row.fromSalary)}
                        <LuArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
                        <span className="font-semibold text-slate-900">{formatTaka(row.toSalary)}</span>
                      </p>
                      <p className={`text-xs font-semibold ${changeTone(row.difference)}`}>{changeText(row.difference, row.percent)} in all</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-slate-800">
                        {row.count} change{row.count === 1 ? "" : "s"}
                        {row.hasUpcoming && (
                          <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Upcoming</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">Last on {formatDate(row.lastSetAt)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-slate-600 sm:justify-self-end">
                      {isOpen ? "Hide" : "Details"}
                      <LuChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 bg-slate-50 px-5 pb-5">
                      <ChangeRows changes={row.changes} />
                      <button
                        type="button"
                        onClick={() => onHistory(row.user._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                      >
                        <LuHistory className="size-3.5" aria-hidden="true" />
                        Full history from joining
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
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
    </div>
  );
};

export default IncrementLog;
