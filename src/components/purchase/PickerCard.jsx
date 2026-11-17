// White card with a step number (or icon), a small eyebrow, a title and optional buttons on the right.
// Used by the supplier / product pickers and the purchase form sections.
//   step: "1", "2"… shown in a round badge; icon: a react-icons component shown instead of a step
export const SectionHeading = ({ step, icon: IconComponent, eyebrow, title, actions, className = "" }) => (
  <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
    <div className="flex min-w-0 items-center gap-3">
      {(step || IconComponent) && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {IconComponent ? <IconComponent className="h-4 w-4" aria-hidden="true" /> : step}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</p>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

const PickerCard = ({ step, icon, eyebrow, title, actions, children, className = "" }) => (
  <section className={`flex min-w-0 flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`}>
    <SectionHeading step={step} icon={icon} eyebrow={eyebrow} title={title} actions={actions} className="mb-4" />
    {children}
  </section>
);

export default PickerCard;
