import { Link } from "react-router";

// "View all" in a card's corner; renders nothing when there is no page to go to
const ViewAllLink = ({ to }) =>
  to ? (
    <Link to={to} className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">
      View all
    </Link>
  ) : null;

export default ViewAllLink;
