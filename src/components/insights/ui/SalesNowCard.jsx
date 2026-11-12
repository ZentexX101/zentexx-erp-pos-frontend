import { LuCalendarCheck, LuCalendarDays } from "react-icons/lu";
import { Link } from "react-router";
import { SERIES_COLORS } from "../../../constants/chart";
import { countLabel } from "../../../utils/insights";
import { formatTaka, takaInWords } from "../../../utils/money";

// One half of the card: an icon, the label and order count, the amount and the amount in words
const Figure = ({ icon, label, figure }) => {
  const Icon = icon;
  return (
    <div className="flex-1 px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${SERIES_COLORS.sales}1a`, color: SERIES_COLORS.sales }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-medium leading-tight text-slate-500">{label}</p>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-800"
          style={{ backgroundColor: `${SERIES_COLORS.sales}1f` }}
        >
          {countLabel(figure.count, "order")}
        </span>
      </div>
      <p className="mt-2 break-all text-2xl font-bold tracking-tight tabular-nums text-slate-900">{formatTaka(figure.total)}</p>
      <p className="truncate text-xs font-medium text-slate-600" title={takaInWords(figure.total)}>
        {takaInWords(figure.total)}
      </p>
    </div>
  );
};

// This month's and today's sales in one headline card. They always mean the calendar month and today,
// whatever period the dashboard is showing. salesNow: { month, today } from the overview.
const SalesNowCard = ({ salesNow, link }) => {
  const body = (
    <div className="flex h-full flex-col divide-y divide-slate-100">
      <Figure icon={LuCalendarDays} label="This Month Sales" figure={salesNow.month} />
      <Figure icon={LuCalendarCheck} label="Today's Sales" figure={salesNow.today} />
    </div>
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

export default SalesNowCard;
