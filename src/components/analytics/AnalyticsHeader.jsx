import { LuRefreshCw } from "react-icons/lu";
import { formatDate } from "../../utils/formatDate";
import Select from "../common/forms/Select";
import PeriodPicker from "./ui/PeriodPicker";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const timeOf = (ms) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// Greeting on the left; on the right one compact toolbar: branch (main admin, all-branch view),
// period with its dates, and Refresh. On phones the toolbar sits under the greeting at full width.
const AnalyticsHeader = ({ user, subtitle, period, range, onPeriod, branches, branch, onBranch, onRefresh, refreshing, updatedAt }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{formatDate(new Date())}</p>
      <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {greeting()}, {user.name.split(" ")[0]}
      </h1>
      <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
    </div>

    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
      {branches && (
        <Select
          variant="filter"
          aria-label="Branch"
          placeholder="All branches"
          options={branches.map((b) => ({ value: b._id, label: b.name }))}
          value={branch}
          onChange={(e) => onBranch(e.target.value)}
          className="w-full sm:w-48"
        />
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:w-80 lg:flex-none">
        <div className="min-w-0 flex-1">
          <PeriodPicker value={period} range={range} onChange={onPeriod} />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title={updatedAt ? `Refresh (updated ${timeOf(updatedAt)})` : "Refresh"}
          aria-label="Refresh"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
        >
          <LuRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
);

export default AnalyticsHeader;
