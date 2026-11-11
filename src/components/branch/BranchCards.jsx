import { LuArrowRight, LuLogIn, LuMapPin, LuPencil, LuPhone, LuTrash2 } from "react-icons/lu";
import { BRANCH_STATUS } from "../../constants/branch";
import Spinner from "../common/loaders/Spinner";
import { formatDate } from "../../utils/formatDate";

// Two letters for the avatar: "Decent Plus" → "DP", "Khulshi" → "KH"
const initialsOf = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
};



const iconButton =
  "inline-flex size-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20";

// One line of contact info with its icon
const Info = ({ icon, children }) => {
  const IconTag = icon;
  return (
    <p className="flex items-start gap-2 text-sm text-slate-700">
      <IconTag className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
};

// The branch list on phones: one card per branch (the table takes over from sm).
// Avatar, name, status and since-when on top; contact in a soft box; "Login to branch" as the card's main action.
const BranchCards = ({ branches, loading, emptyMessage, onLogin, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center rounded-2xl bg-white py-16 shadow-sm ring-1 ring-slate-200/80">
        <Spinner className="h-6 w-6 text-brand" />
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-4 py-16 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {branches.map((b) => {
        const active = b.status === BRANCH_STATUS.ACTIVE;
        return (
          <li key={b._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className="p-4">
              {/* Avatar, name, status · since, and the quiet actions */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold tracking-wide ring-1 ring-inset ${
                    active ? "bg-slate-100 text-slate-700 ring-slate-200" : "bg-slate-50 text-slate-400 ring-slate-100"
                  }`}
                  aria-hidden="true"
                >
                  {initialsOf(b.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 break-words font-semibold leading-snug text-slate-900" title={b.name}>
                    {b.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`inline-flex items-center gap-1 font-medium ${active ? "text-emerald-600" : "text-slate-500"}`}>
                      <span className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                      {active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="truncate">Since {formatDate(b.createdAt)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" onClick={() => onEdit(b)} aria-label={`Edit ${b.name}`} title="Edit" className={`${iconButton} bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900`}>
                    <LuPencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(b)}
                    aria-label={`Delete ${b.name}`}
                    title="Delete"
                    className={`${iconButton} bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600`}
                  >
                    <LuTrash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 px-3 py-2.5">
                <Info icon={LuMapPin}>{b.address}</Info>
                <Info icon={LuPhone}>
                  <a href={`tel:${b.phone}`} className="tabular-nums hover:underline">
                    {b.phone}
                  </a>
                </Info>
              </div>
            </div>

            {/* Main action */}
            <button
              type="button"
              onClick={() => onLogin(b)}
              className="group flex w-full items-center gap-2 border-t border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:bg-blue-100 focus-visible:outline-none"
            >
              <LuLogIn className="size-4" aria-hidden="true" />
              Login to branch
              <LuArrowRight
                className="ml-auto size-4 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default BranchCards;
