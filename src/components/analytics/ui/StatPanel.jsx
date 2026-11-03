import { LuArrowUpRight } from "react-icons/lu";
import { Link } from "react-router";

// One number inside a StatPanel. tone colours the small icon; valueClass the number when it means
// something (due = red). link: { to, onClick } from useCardLink; the tile then opens that page and
// shows an arrow on hover.
export const StatTile = ({ icon, label, value, hint, tone = "#64748b", valueClass = "text-slate-900", link }) => {
  const Icon = icon;
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${tone}17`, color: tone }}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-600">{label}</p>
        {link && (
          <LuArrowUpRight
            className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
            aria-hidden="true"
          />
        )}
      </div>
      <p className={`mt-3 truncate text-xl font-bold tracking-tight tabular-nums ${valueClass}`} title={typeof value === "string" ? value : undefined}>
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
    </>
  );

  return link ? (
    <Link
      to={link.to}
      onClick={link.onClick}
      className="group block min-w-0 bg-white p-4 transition hover:bg-slate-50/80 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/20 sm:p-5"
    >
      {body}
    </Link>
  ) : (
    <div className="min-w-0 bg-white p-4 sm:p-5">{body}</div>
  );
};

// A titled panel of StatTiles separated by hairlines (calmer than a wall of separate cards).
// An odd number of tiles leaves white space, not a grey hole.
const StatPanel = ({ icon, title, hint, children }) => {
  const Icon = icon;
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="flex min-w-0 items-center gap-2.5 font-semibold text-slate-900">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="truncate">{title}</span>
        </h2>
        {hint && <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{hint}</span>}
      </div>
      {/* Hairlines are each tile's right / bottom border; the outer edge ones hide under the negative margin */}
      <div className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 [&>*]:border-b [&>*]:border-r [&>*]:border-slate-100">{children}</div>
    </section>
  );
};

export default StatPanel;
