import { LuArrowDownLeft, LuArrowUpRight } from "react-icons/lu";

// Sent (stock went out) or Received (stock came in), seen from this branch
const DirectionBadge = ({ sent }) =>
  sent ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      <LuArrowUpRight className="h-3 w-3" aria-hidden="true" />
      Sent
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <LuArrowDownLeft className="h-3 w-3" aria-hidden="true" />
      Received
    </span>
  );

export default DirectionBadge;
