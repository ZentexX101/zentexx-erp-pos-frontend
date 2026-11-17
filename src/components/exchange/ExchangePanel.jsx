// A right-side panel on the exchange screen, styled like the POS cart: icon + title (+ Bangla) in a header bar.
// aside: small content on the right of the header (a count, a button)
const ExchangePanel = ({ icon: IconComponent, title, bn, aside, children, bodyClassName = "space-y-4" }) => (
  <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
        {IconComponent && <IconComponent className="size-4 shrink-0 text-slate-500" aria-hidden="true" />}
        <span className="truncate">{title}</span>
        {bn && <span className="truncate text-xs font-normal text-slate-400">{bn}</span>}
      </h2>
      {aside}
    </div>
    <div className={`p-4 ${bodyClassName}`}>{children}</div>
  </section>
);

export default ExchangePanel;
