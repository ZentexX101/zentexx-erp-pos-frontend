import Spinner from "../loaders/Spinner";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const Button = ({ children, className = "", type = "button", variant = "primary", loading = false, disabled, ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
