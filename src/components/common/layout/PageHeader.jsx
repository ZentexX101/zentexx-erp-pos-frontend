// Page title row; actions go on the right (e.g. a "Create" button), tools (e.g. Export PDF) just before them
const PageHeader = ({ title, subtitle, actions, tools }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {(tools || actions) && (
      <div className="flex flex-wrap gap-2">
        {tools}
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;
