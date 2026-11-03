import { useId } from "react";
import { Link } from "react-router";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// One of the four headline numbers at the top: icon, label, big value, a line of context and a
// soft sparkline of the period (spark: [{ value }]). color: the measure's colour; glow: its key in
// index.css (sales, purchases, expenses, profit) for the soft shadow under the line.
// badge: a count to stand out at the top right ("9 orders"), on a tint of the colour.
// link: { to, onClick } from useCardLink; the card then opens that page.
// words: the amount written out under the value ("Five Hundred Taka"); long ones are cut, the full text is on hover.
const HeroCard = ({ icon, label, value, words, hint, badge, color, glow, spark, valueClass = "text-slate-900", link }) => {
  const Icon = icon;
  const gradientId = useId().replace(/:/g, "");

  const body = (
    <>
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1a`, color }}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-500">{label}</p>
        {badge && (
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold tabular-nums text-slate-800"
            style={{ backgroundColor: `${color}1f` }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
            {badge}
          </span>
        )}
      </div>
      <p className={`truncate px-5 pt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-[1.7rem] ${valueClass}`} title={value}>
        {value}
      </p>
      {words && (
        <p className="truncate px-5 pt-1 text-[13px] font-medium text-slate-600" title={words}>
          {words}
        </p>
      )}
      {hint && <p className="truncate px-5 pt-1 text-sm text-slate-500">{hint}</p>}

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
  return link ? (
    <Link to={link.to} onClick={link.onClick} className={`${className} hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

export default HeroCard;
