import { useId } from "react";
import { LuChevronDown } from "react-icons/lu";

// form: labelled field in forms. filter: compact control for list filters (highlighted once a value is picked)
const VARIANTS = {
  form: {
    label: "mb-1 block text-sm font-medium text-slate-700",
    select: "rounded-md py-2 text-slate-900 focus:ring-2",
    normal: "border-slate-300 hover:border-slate-400 focus:border-slate-400 focus:ring-brand/10",
  },
  filter: {
    label: "mb-1 block text-xs font-medium text-slate-600",
    select: "h-10 rounded-lg text-sm shadow-xs focus:ring-2",
    normal: "border-slate-300 text-slate-700 hover:border-slate-400 focus:border-slate-500 focus:ring-brand/10",
    active: "border-slate-500 font-medium text-slate-900 focus:ring-brand/10",
  },
};

// Native select with our own chevron. options: [{ value, label }]; extra <option>s can be passed as children.
// `error` shows a message under form selects; any truthy error turns the border red.
const Select = ({ label, error, options = [], placeholder, required = false, variant = "form", className = "", children, ...props }) => {
  const id = useId();
  const styles = VARIANTS[variant];
  const state = error ? "border-red-400 focus:ring-red-200" : styles.active && props.value ? styles.active : styles.normal;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          className={`w-full cursor-pointer appearance-none truncate border bg-white pl-3 pr-10 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${styles.select} ${state}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      </div>
      {variant === "form" && typeof error === "string" && error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
