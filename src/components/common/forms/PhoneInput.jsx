import { useId } from "react";

// Bangladesh mobile number with a fixed +880 prefix. value / onChange use the local
// part as typed ("1712345678" or "01712345678"); use toE164 / fromE164 to convert.
const PhoneInput = ({ label, error, required = false, value, onChange, className = "", ...props }) => {
  const id = useId();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div
        className={`flex rounded-md border bg-white transition focus-within:ring-2 ${
          error ? "border-red-400 focus-within:ring-red-200" : "border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-100"
        }`}
      >
        <span className="flex items-center gap-2 border-r border-slate-200 px-3 text-sm text-slate-600">
          <span className="relative inline-block h-3 w-5 rounded-sm bg-green-700" aria-hidden="true">
            <span className="absolute left-[7px] top-[2px] h-2 w-2 rounded-full bg-red-600" />
          </span>
          +880
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          aria-invalid={Boolean(error)}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
          placeholder="1712 345678"
          className="min-w-0 flex-1 rounded-r-md px-3 py-2 text-slate-900 outline-none"
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
