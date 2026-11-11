import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
import { useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import { Link, useLocation } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Badge from "../../components/common/data/Badge";
import Pagination from "../../components/common/data/Pagination";
import FilterBar from "../../components/common/forms/FilterBar";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import PageHeader from "../../components/common/layout/PageHeader";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import PersonCell from "../../components/hr/PersonCell";
import { isMainAdmin } from "../../constants/roles";
import { staffFilePath } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useBranchNamesData } from "../../hooks/useBranchApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useStaffListData } from "../../hooks/useHrApi";
import { currentMonth } from "../../utils/hr";
import { formatTaka } from "../../utils/money";

const LEFT_OPTIONS = [{ value: "true", label: "Who left" }];
const head = "px-3 py-3 text-right font-semibold";
const count = "whitespace-nowrap px-3 py-3 text-right tabular-nums";

const Count = ({ value, tone = "text-slate-700" }) =>
  value > 0 ? <span className={`font-semibold ${tone}`}>{value}</span> : <span className="text-slate-300">0</span>;

// Every staff member with where their month stands. Open anyone for their whole history.
// In a branch: that branch's staff. On the main panel, a main admin can see all of them or pick a branch.
const StaffFiles = () => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const inBranch = useLocation().pathname.startsWith("/branch");
  const pickBranch = isMainAdmin(user) && !inBranch;

  // all states
  const [month, setMonth] = useState(currentMonth());
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [branchFilter, setBranchFilter] = useState("");
  const [left, setLeft] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // call hr api (search, filters and paging run on the backend)
  const branch = inBranch ? activeBranch?._id : branchFilter;
  const { data, isLoading, error } = useStaffListData({ branch: isMainAdmin(user) ? branch : undefined, search, month, left, page, limit });
  const { data: branches = [] } = useBranchNamesData();
  const rows = data?.data ?? [];
  const showBranch = pickBranch && !branchFilter;

  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff History"
        subtitle="Open anyone to see their attendance, leave, salary, advances and incentive"
        actions={
          // Phones: one row, the month taking the room left by Export PDF
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ExportPdfButton
              report={pdfReports.staffHistory(showBranch)}
              params={{ branch: isMainAdmin(user) ? branch : undefined, search, left }}
              scope={pickBranch ? branches.find((b) => b._id === branchFilter)?.name : undefined}
            />
            <MonthSwitcher month={month} onChange={withPageReset(setMonth)} className="min-w-0 flex-1 sm:flex-none" />
          </div>
        }
      />

      <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Name, job, ID or phone..." />}>
        {pickBranch && (
          <Select
            variant="filter"
            className="sm:w-52"
            aria-label="Branch"
            placeholder="All branches"
            options={branches.map((b) => ({ value: b._id, label: b.name }))}
            value={branchFilter}
            onChange={(e) => withPageReset(setBranchFilter)(e.target.value)}
          />
        )}
        <Select
          variant="filter"
          aria-label="Working or left"
          placeholder="Working now"
          options={LEFT_OPTIONS}
          value={left}
          onChange={(e) => withPageReset(setLeft)(e.target.value)}
        />
      </FilterBar>

      <Alert>{error?.message}</Alert>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-48 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">{search ? "No staff found." : "No staff yet. Add them from the Staff page."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold sm:px-5">Staff</th>
                  {showBranch && <th className="hidden px-3 py-3 font-semibold lg:table-cell">Branch</th>}
                  <th className={head}>Came</th>
                  <th className={head}>Late</th>
                  <th className={head}>Leave</th>
                  <th className={head}>Absent</th>
                  <th className={head}>Salary</th>
                  <th className={head}>Cut</th>
                  <th className={head}>Incentive</th>
                  <th className={head}>Advance</th>
                  <th className="px-3 py-3 font-semibold">Salary paid</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.user._id} className="group transition-colors hover:bg-slate-50">
                    <td className="px-3 py-3 sm:px-5">
                      {/* Narrower on phones so more numbers show beside it */}
                      <Link to={staffFilePath(row.user._id, inBranch)} className="block w-40 hover:opacity-80 sm:w-auto">
                        <PersonCell person={row.user} />
                      </Link>
                      {/* Below lg the Branch column is hidden, so the branch sits under the name */}
                      {showBranch && <p className="mt-0.5 w-40 truncate pl-12 text-[11px] font-medium text-slate-400 sm:w-auto lg:hidden">{row.branch ?? "—"}</p>}
                    </td>
                    {showBranch && <td className="hidden whitespace-nowrap px-3 py-3 text-slate-600 lg:table-cell">{row.branch ?? "—"}</td>}
                    <td className={count}>
                      <Count value={row.counts.present} tone="text-emerald-600" />
                    </td>
                    <td className={count}>
                      <Count value={row.counts.late} tone="text-amber-600" />
                    </td>
                    <td className={count}>
                      <Count value={row.counts.leave + row.counts.unpaidLeave} tone="text-blue-600" />
                    </td>
                    <td className={count}>
                      <Count value={row.counts.absent} tone="text-red-600" />
                    </td>
                    <td className={count}>{row.basic ? formatTaka(row.basic) : <span className="text-xs text-amber-700">Not set</span>}</td>
                    <td className={count}>
                      {row.absentDeduction > 0 ? (
                        <span className="text-red-600">− {formatTaka(row.absentDeduction)}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={count}>
                      {row.incentive > 0 ? <span className="text-emerald-700">{formatTaka(row.incentive)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className={count}>
                      {row.advanceOwed > 0 ? <span className="text-amber-700">{formatTaka(row.advanceOwed)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {row.paid !== null ? (
                        <Badge dot tone="green">
                          {formatTaka(row.paid)}
                        </Badge>
                      ) : (
                        <Badge dot tone="slate">
                          Not yet
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        to={staffFilePath(row.user._id, inBranch)}
                        aria-label={`Open ${row.user.name}`}
                        title="Open file"
                        className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <LuChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={withPageReset(setLimit)} />
    </div>
  );
};

export default StaffFiles;
