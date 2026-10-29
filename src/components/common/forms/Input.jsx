import { useId, useState } from "react";
import Icon from "../icons/Icon";

const EyeIcon = ({ open }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {!open && <path d="M3 3l18 18" />}
  </svg>
);

// default: dashboard forms. soft: taller, rounded, brand-black focus (auth screens)
const VARIANTS = {
  default: {
    label: "text-sm font-medium text-slate-700",
    input: "rounded-md bg-white focus:ring-2",
    normal: "border-slate-300 focus:border-slate-400 focus:ring-brand/10",
    error: "border-red-400 focus:ring-red-200",
  },
  soft: {
    label: "text-[13px] font-medium text-neutral-800",
    input: "h-12 rounded-lg bg-neutral-50 placeholder:text-neutral-400 focus:bg-white focus:ring-4 lg:h-11",
    normal: "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/5",
    error: "border-red-400 focus:ring-red-100",
  },
};

// Labelled text input; type="password" gets a show / hide toggle, `icon` adds a leading Icon,
// `labelAside` sits at the right end of the label row, `inputClassName` styles the <input> itself
const Input = ({
  label,
  labelAside,
  error,
  type = "text",
  required = false,
  icon,
  variant = "default",
  inputClassName = "",
  className = "",
  ...props
}) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const styles = VARIANTS[variant];

  return (
    <div className={className}>
      {label && (
        <div className="mb-1 flex items-center justify-between gap-3">
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
          {labelAside}
        </div>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon name={icon} className="h-[18px] w-[18px]" />
          </span>
        )}
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={Boolean(error)}
          className={`w-full border px-3 py-2 text-slate-900 outline-none transition autofill-white ${
            styles.input
          } ${error ? styles.error : styles.normal} ${isPassword ? "pr-10" : ""} ${icon ? "pl-10" : ""} ${inputClassName}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
