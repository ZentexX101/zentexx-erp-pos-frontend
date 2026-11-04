const tones = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-800",
  purple: "bg-purple-100 text-purple-700",
  slate: "bg-slate-100 text-slate-600",
  outline: "border border-slate-200 bg-white text-slate-500",
};

const DOTS = {
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  slate: "bg-slate-400",
  outline: "bg-slate-300",
};

// dot: a small status dot before the text
const Badge = ({ tone = "slate", dot = false, children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}>
    {dot && <span className={`mr-1.5 size-1.5 rounded-full ${DOTS[tone]}`} aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;
