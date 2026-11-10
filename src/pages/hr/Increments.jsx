import { useState } from "react";
import { LuCalendarClock, LuTrendingUp, LuUsers, LuWallet } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import SearchInput from "../../components/common/forms/SearchInput";
import PageHeader from "../../components/common/layout/PageHeader";
import HrStat from "../../components/hr/HrStat";
import ChangeSalaryModal from "../../components/hr/increment/ChangeSalaryModal";
import IncrementLog from "../../components/hr/increment/IncrementLog";
import SalaryHistoryModal from "../../components/hr/increment/SalaryHistoryModal";
import SalaryStaffList from "../../components/hr/increment/SalaryStaffList";
import { pdfReports } from "../../constants/pdfReports";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useCreateIncrement, useSalaryOverviewData } from "../../hooks/useHrApi";
import { hasPermission } from "../../utils/access";
import { monthLabel } from "../../utils/hr";
import { changeText } from "../../utils/increment";
import { formatTaka } from "../../utils/money";

const VIEWS = [
  { value: "staff", label: "Staff salaries" },
  { value: "log", label: "Changes by staff" },
];

// Increment: each staff member's salary now with their history, and every change by date
const Increments = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "hr.manage");

  // all states
  const [view, setView] = useState("staff");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [historyOf, setHistoryOf] = useState(null); // user id
  const [changing, setChanging] = useState(null); // null, "" (pick a person) or a user id

  // call hr api
  const { data, isLoading, error } = useSalaryOverviewData({ search });
  const { data: everyone } = useSalaryOverviewData({});
  const create = useCreateIncrement();
  const rows = data?.rows ?? [];
  const summary = data?.summary;

  const save = async (values) => {
    await create.mutateAsync(values);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Increment"
        subtitle="Salary of every staff member, each change with its date and reason"
        tools={<ExportPdfButton report={pdfReports.increments()} params={{}} />}
        actions={canManage && <Button onClick={() => setChanging("")}>Change salary</Button>}
      />

      <Alert>{error?.message}</Alert>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <HrStat
          label="Salary bill this month"
          value={summary ? formatTaka(summary.monthlyBill) : "—"}
          hint={summary ? `${summary.staff} staff · ${monthLabel(data.month)}` : ""}
          icon={LuWallet}
          accent="blue"
        />
        <HrStat label="Changes this year" value={summary?.changesThisYear ?? "—"} icon={LuCalendarClock} accent="purple" />
        <HrStat
          label="Raised this year"
          value={summary ? changeText(summary.raiseThisYear) || formatTaka(0) : "—"}
          hint="a month, all staff together"
          tone={summary?.raiseThisYear < 0 ? "text-red-600" : "text-emerald-600"}
          icon={LuTrendingUp}
          accent="green"
        />
        <HrStat label="Upcoming changes" value={summary?.upcoming ?? "—"} hint="set for a later month" icon={LuUsers} accent="amber" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex self-start rounded-xl bg-slate-100 p-1" role="tablist" aria-label="View">
          {VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={view === option.value}
              onClick={() => setView(option.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${view === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {view === "staff" && (
          <div className="sm:w-72">
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search name, ID or designation" />
          </div>
        )}
      </div>

      {view === "staff" ? (
        <SalaryStaffList rows={rows} isLoading={isLoading && !data} onHistory={setHistoryOf} onChange={canManage ? (id) => setChanging(id) : null} />
      ) : (
        <IncrementLog staff={everyone?.rows ?? []} onHistory={setHistoryOf} />
      )}

      {historyOf && (
        <SalaryHistoryModal
          userId={historyOf}
          onClose={() => setHistoryOf(null)}
          onChange={
            canManage
              ? () => {
                  setChanging(historyOf);
                  setHistoryOf(null);
                }
              : null
          }
        />
      )}
      {changing !== null && (
        <ChangeSalaryModal rows={everyone?.rows ?? []} userId={changing || null} onClose={() => setChanging(null)} onSave={save} saving={create.isPending} />
      )}
    </div>
  );
};

export default Increments;
