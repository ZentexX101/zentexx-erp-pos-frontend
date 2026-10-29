import Spinner from "../loaders/Spinner";

const variants = {
  primary: "rounded-md bg-brand text-white hover:bg-brand-hover",
  secondary: "rounded-md bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger: "rounded-md bg-red-600 text-white hover:bg-red-700",
  dangerOutline: "rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50",
  dark: "rounded-lg bg-brand text-white shadow-sm hover:bg-brand-hover active:translate-y-px",
};

const Button = ({ children, className = "", type = "button", variant = "primary", loading = false, disabled, ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;

// Example:
// <Button type="submit" loading={submitting}>Save</Button>
// <Button variant="secondary" onClick={onCancel}>Cancel</Button>
