import { LuRefreshCw } from "react-icons/lu";
import { formatDate } from "../../utils/formatDate";
import Button from "../common/buttons/Button";
import Select from "../common/forms/Select";
import PeriodTabs from "./ui/PeriodTabs";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

// Greeting and today's date, then one toolbar: period tabs, branch (main admin, all-branch view), Refresh
const AnalyticsHeader = ({ user, subtitle, period, onPeriod, branches, branch, onBranch, onRefresh, refreshing }) => (
  <div className="space-y-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{formatDate(new Date())}</p>
      <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {greeting()}, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>

    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <PeriodTabs value={period} onChange={onPeriod} />
      <div className="flex items-center gap-2">
        {branches && (
          <Select
            variant="filter"
            aria-label="Branch"
            placeholder="All branches"
            options={branches.map((b) => ({ value: b._id, label: b.name }))}
            value={branch}
            onChange={(e) => onBranch(e.target.value)}
            className="min-w-44"
          />
        )}
        <Button variant="secondary" onClick={onRefresh} disabled={refreshing} className="h-10 shrink-0 rounded-lg" aria-label="Refresh">
          <LuRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  </div>
);

export default AnalyticsHeader;
