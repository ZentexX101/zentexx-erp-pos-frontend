import { formatTaka } from "../../utils/money";
import Button from "../common/buttons/Button";

// Sticky bottom bar: the totals and the submit button. amounts: [{ label, value, className }]
const PurchaseSummaryBar = ({ amounts, submitLabel, onSubmit, submitting, disabled }) => (
  <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
    <dl className="flex flex-wrap gap-x-8 gap-y-2">
      {amounts.map(({ label, value, className = "text-slate-900" }) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className={`text-lg font-bold ${className}`}>{formatTaka(value)}</dd>
        </div>
      ))}
    </dl>
    <Button onClick={onSubmit} loading={submitting} disabled={disabled} className="min-w-44">
      {submitLabel}
    </Button>
  </div>
);

export default PurchaseSummaryBar;
