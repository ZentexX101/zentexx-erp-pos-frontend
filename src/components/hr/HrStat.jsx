// A soft icon tint for each kind of figure
const ACCENTS = {
  slate: "bg-slate-100 text-slate-500",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-500",
  purple: "bg-violet-50 text-violet-600",
};

// One small figure at the top of an HR page. tone colours the number when it means something;
// icon + accent add a soft icon in the corner.
const HrStat = ({ label, value, hint, tone = "text-slate-900", icon, accent = "slate" }) => {
  const Icon = icon;
  return (
    <div className="flex min-w-0 items-start justify-between gap-2 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md sm:gap-3 sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-[13px]">{label}</p>
        <p className={`mt-1 text-lg font-bold tracking-tight tabular-nums break-all sm:mt-1.5 sm:text-2xl ${tone}`}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl ${ACCENTS[accent]}`} aria-hidden="true">
          <Icon className="size-4 sm:size-5" />
        </span>
      )}
    </div>
  );
};

export default HrStat;
