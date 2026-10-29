import { useId } from "react";

// options: [{ value, label }]
const Select = ({ label, error, options, placeholder, required = false, className = "", ...props }) => {
  const id = useId();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-md border bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-slate-400 focus:ring-brand/10"
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
