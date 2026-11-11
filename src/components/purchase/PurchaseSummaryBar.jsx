import { formatTaka } from "../../utils/money";
import Button from "../common/buttons/Button";

// Sticky bottom bar: the totals and the submit button. amounts: [{ label, value, className }]
const PurchaseSummaryBar = ({ amounts, submitLabel, onSubmit, submitting, disabled }) => (
  <div className="sticky bottom-0 z-10 flex flex-col gap-2.5 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
    {/* Phones: the amounts as three equal columns, the button under them */}
    <dl className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
      {amounts.map(({ label, value, className = "text-slate-900" }) => (
        <div key={label} className="min-w-0">
          <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">{label}</dt>
          <dd className={`break-all text-sm font-bold tabular-nums sm:text-lg ${className}`}>{formatTaka(value)}</dd>
        </div>
      ))}
    </dl>
    <Button onClick={onSubmit} loading={submitting} disabled={disabled} className="w-full sm:w-auto sm:min-w-44">
      {submitLabel}
    </Button>
  </div>
);

export default PurchaseSummaryBar;
