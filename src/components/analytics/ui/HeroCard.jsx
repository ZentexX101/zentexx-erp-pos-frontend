import { useId } from "react";
import { Link } from "react-router";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// One of the four headline numbers at the top: icon, label, big value, a line of context and a
// soft sparkline of the period (spark: [{ value }]). color: the measure's colour; glow: its key in
// index.css (sales, purchases, expenses, profit) for the soft shadow under the line.
const HeroCard = ({ icon, label, value, hint, color, glow, spark, valueClass = "text-slate-900", to }) => {
  const Icon = icon;
  const gradientId = useId().replace(/:/g, "");

  const body = (
    <>
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 truncate text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className={`truncate px-5 pt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-[1.7rem] ${valueClass}`} title={value}>
        {value}
      </p>
      {hint && <p className="truncate px-5 pt-0.5 text-xs text-slate-500">{hint}</p>}

      <div className="mt-2 h-14" aria-hidden="true">
        {spark?.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                className={glow ? `chart-glow-${glow}` : undefined}
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${gradientId})`}
                // Fill down to the bottom of the sparkline, not to 0: with negative values (a loss)
                // 0 sits at the top and the fill would spill above the line
                baseValue="dataMin"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );

  const className = "block min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition";
  return to ? (
    <Link to={to} className={`${className} hover:-translate-y-0.5 hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

export default HeroCard;
