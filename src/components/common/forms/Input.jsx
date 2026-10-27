import { useId, useState } from "react";

const EyeIcon = ({ open }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {!open && <path d="M3 3l18 18" />}
  </svg>
);

// Labelled text input; type="password" gets a show / hide toggle
const Input = ({ label, error, type = "text", required = false, className = "", ...props }) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-md border bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
            error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          } ${isPassword ? "pr-10" : ""}`}
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
