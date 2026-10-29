// White card with a title row, a body and an optional footer (actions on the right)
const SettingsCard = ({ title, description, children, footer }) => (
  <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <header className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </header>

    <div className="px-5 py-5 sm:px-6">{children}</div>

    {footer && (
      <footer className="flex flex-wrap items-center justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
        {footer}
      </footer>
    )}
  </section>
);

export default SettingsCard;
