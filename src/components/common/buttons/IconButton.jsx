import Icon from "../icons/Icon";

const variants = {
  default: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

// Square icon-only button; label is required for screen readers and the tooltip
const IconButton = ({ icon, label, variant = "default", className = "", ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex rounded-md p-1.5 transition disabled:opacity-50 ${variants[variant]} ${className}`}
    {...props}
  >
    <Icon name={icon} />
  </button>
);

export default IconButton;
