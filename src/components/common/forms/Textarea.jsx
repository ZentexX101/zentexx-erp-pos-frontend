import { useId } from "react";

const Textarea = ({ label, error, maxLength, value, className = "", ...props }) => {
  const id = useId();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={3}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-md border bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
        {...props}
      />
      <div className="flex justify-between">
        {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : <span />}
        {maxLength && (
          <p className="mt-1 text-xs text-slate-400">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Textarea;
