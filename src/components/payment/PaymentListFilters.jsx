import { formatTaka } from "../../utils/money";
import FilterBar from "../common/forms/FilterBar";
import PeriodFilter from "../common/forms/PeriodFilter";
import SearchInput from "../common/forms/SearchInput";
import Select from "../common/forms/Select";

// Period + search (+ branch for main admin lists), and the total for everything that matches.
// Shared by the supplier payment, customer payment and customer payout lists.
const PaymentListFilters = ({ period, onPeriod, searchInput, onSearch, searchPlaceholder, branches, branch, onBranch, summary, noun = "payment" }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <FilterBar search={<SearchInput value={searchInput} onChange={onSearch} placeholder={searchPlaceholder} />}>
      <PeriodFilter value={period} onChange={onPeriod} />
      {branches && (
        <Select
          variant="filter"
          aria-label="Filter by branch"
          placeholder="All branches"
          options={branches.map((b) => ({ value: b._id, label: b.name }))}
          value={branch}
          onChange={(e) => onBranch(e.target.value)}
        />
      )}
    </FilterBar>
    {summary && (
      <p className="text-sm text-slate-600">
        {summary.count} {noun}
        {summary.count === 1 ? "" : "s"} · Total <span className="text-base font-bold text-slate-900">{formatTaka(summary.amount)}</span>
      </p>
    )}
  </div>
);

export default PaymentListFilters;
