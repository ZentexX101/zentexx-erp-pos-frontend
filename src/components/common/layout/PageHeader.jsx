// Page title row; actions go on the right (e.g. a "Create" button), tools (e.g. Export PDF) just before them.
// They share one row while they fit (phones too) and wrap under the title when they don’t.
const PageHeader = ({ title, subtitle, actions, tools }) => (
  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-3 sm:gap-x-4">
    {/* A small basis so a single button (e.g. "Create Category") stays beside the title on phones */}
    <div className="min-w-0 flex-1 basis-28">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
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
