import { Link } from "react-router";

// One number inside a StatPanel. tone colours the small icon; valueClass the number when it means
// something (due = red). to: the details page.
export const StatTile = ({ icon, label, value, hint, tone = "#64748b", valueClass = "text-slate-900", to }) => {
  const Icon = icon;
  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${tone}14`, color: tone }}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <p className="min-w-0 truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className={`mt-2 truncate text-lg font-bold tabular-nums ${valueClass}`} title={typeof value === "string" ? value : undefined}>
        {value}
      </p>
      {hint && <p className="truncate text-[11px] text-slate-400">{hint}</p>}
    </>
  );

  return to ? (
    <Link to={to} className="block min-w-0 bg-white p-4 transition hover:bg-slate-50">
      {body}
    </Link>
  ) : (
    <div className="min-w-0 bg-white p-4">{body}</div>
  );
};

// A titled panel of StatTiles separated by hairlines (calmer than a wall of separate cards).
// An odd number of tiles leaves white space, not a grey hole.
const StatPanel = ({ icon, title, hint, children }) => {
  const Icon = icon;
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="flex min-w-0 items-center gap-2 font-semibold text-slate-900">
          <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{title}</span>
        </h2>
        {hint && <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">{hint}</span>}
      </div>
      {/* Hairlines are each tile's right / bottom border; the outer edge ones hide under the negative margin */}
      <div className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 [&>*]:border-b [&>*]:border-r [&>*]:border-slate-100">{children}</div>
    </section>
  );
};

export default StatPanel;
