// White card with a small eyebrow, a title and optional buttons on the right (supplier / product pickers)
const PickerCard = ({ eyebrow, title, actions, children, className = "" }) => (
  <section className={`flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`}>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
    {children}
  </section>
);

export default PickerCard;
