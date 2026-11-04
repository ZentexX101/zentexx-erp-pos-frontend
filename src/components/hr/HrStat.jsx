// One small figure at the top of an HR page. tone colours the number when it means something.
const HrStat = ({ label, value, hint, tone = "text-slate-900" }) => (
  <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
    <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 truncate text-xl font-bold tabular-nums ${tone}`} title={typeof value === "string" ? value : undefined}>
      {value}
    </p>
    {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
  </div>
);

export default HrStat;
