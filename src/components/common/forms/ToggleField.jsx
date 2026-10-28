import Toggle from "./Toggle";

// A labelled on/off setting with a short explanation
const ToggleField = ({ label, description, checked, onChange, disabled = false }) => (
  <div className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : ""}`}>
    <div>
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} label={label} disabled={disabled} />
  </div>
);

export default ToggleField;
