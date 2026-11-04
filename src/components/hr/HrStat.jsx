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
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-slate-500">{label}</p>
        <p className={`mt-1.5 truncate text-2xl font-bold tracking-tight tabular-nums ${tone}`} title={typeof value === "string" ? value : undefined}>
          {value}
        </p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`} aria-hidden="true">
          <Icon className="size-5" />
        </span>
      )}
    </div>
  );
};

export default HrStat;
