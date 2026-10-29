import Icon from "../icons/Icon";

// Bordered group of related fields with a heading
const FormSection = ({ title, description, icon, actions, muted = false, children }) => (
  <section className={`rounded-lg border border-slate-200 p-4 sm:p-5 ${muted ? "bg-slate-50" : "bg-white"}`}>
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 text-slate-500">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {actions}
    </div>
    {children}
  </section>
);

export default FormSection;
