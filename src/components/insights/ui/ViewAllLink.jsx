import { LuArrowRight } from "react-icons/lu";
import { Link } from "react-router";

// "View all" in a card's corner. link: { to, onClick } from useCardLink; nothing when there is no page to open.
const ViewAllLink = ({ link }) =>
  link ? (
    <Link
      to={link.to}
      onClick={link.onClick}
      className="group inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      View all
      <LuArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  ) : null;

export default ViewAllLink;
