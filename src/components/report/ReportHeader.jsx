import { LuPrinter, LuRefreshCw } from "react-icons/lu";
import PeriodPicker from "../insights/ui/PeriodPicker";
import PageHeader from "../common/layout/PageHeader";
import Select from "../common/forms/Select";

const iconButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs outline-none transition hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand/20 disabled:opacity-60";

// A report's title and controls: branch (main panel), period, refresh and Print / PDF.
const ReportHeader = ({ title, subtitle, scope, period, range, onPeriod, onRefresh, refreshing, canExport }) => (
  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
    <PageHeader title={title} subtitle={subtitle} />
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      {scope.branches && (
        <Select
          variant="filter"
          aria-label="Branch"
          placeholder="All branches"
          options={scope.branches.map((b) => ({ value: b._id, label: b.name }))}
          value={scope.branchFilter}
          onChange={(e) => scope.setBranchFilter(e.target.value)}
          className="w-full sm:w-44"
        />
      )}
      <div className="min-w-0 flex-1 sm:w-80 sm:flex-none">
        <PeriodPicker value={period} range={range} onChange={onPeriod} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onRefresh} disabled={refreshing} aria-label="Refresh" title="Refresh" className={iconButton}>
          <LuRefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
        {canExport && (
          <button type="button" onClick={() => window.print()} className={`${iconButton} flex-1 sm:flex-none`}>
            <LuPrinter className="size-4" aria-hidden="true" />
            Print / PDF
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ReportHeader;
