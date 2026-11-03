// White card for one chart or list: title row, optional action, and a body that never overflows.
// empty shows a quiet message instead of an empty chart.
const ChartCard = ({ icon, title, subtitle, action, empty, emptyText = "No data for this period yet.", className = "", children }) => {
  const Icon = icon;
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {empty ? (
        <p className="flex flex-1 items-center justify-center py-12 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <div className="min-w-0 flex-1">{children}</div>
      )}
    </section>
  );
};

export default ChartCard;
