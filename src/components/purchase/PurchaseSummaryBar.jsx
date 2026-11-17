import { formatTaka } from "../../utils/money";
import Button from "../common/buttons/Button";

// Sticky bottom bar: the totals and the submit button. amounts: [{ label, value, className }]
// info: optional small line on the left ("2 products · 11 pcs")
const PurchaseSummaryBar = ({ amounts, info, submitLabel, onSubmit, submitting, disabled }) => (
  <div className="sticky bottom-0 z-10 flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.18)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      {info && <p className="hidden shrink-0 text-xs font-medium text-slate-500 lg:block">{info}</p>}
      {/* Phones: the amounts as three equal columns, the button under them */}
      <dl className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-x-2 sm:gap-y-2">
        {amounts.map(({ label, value, className = "text-slate-900" }) => (
          <div key={label} className="min-w-0 rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-inset ring-slate-200 sm:min-w-32 sm:px-3.5">
            <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-[11px]">{label}</dt>
            <dd className={`break-all text-sm font-bold tabular-nums sm:text-lg ${className}`}>{formatTaka(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
    <Button onClick={onSubmit} loading={submitting} disabled={disabled} className="w-full sm:w-auto sm:min-w-44">
      {submitLabel}
    </Button>
  </div>
);

export default PurchaseSummaryBar;
