import { LuArrowRight, LuBanknote, LuLayoutDashboard, LuLogIn, LuMail, LuPencil, LuPhone, LuShieldCheck, LuTrash2 } from "react-icons/lu";
import { canManageUser, isBranchRole, ROLE_LABELS, ROLE_TONES } from "../../constants/roles";
import { formatPhone } from "../../utils/phone";
import Badge from "../common/data/Badge";
import Spinner from "../common/loaders/Spinner";

// Two letters for the avatar: "Azmian Jackson" → "AJ", "rahat" → "RA"
const initialsOf = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
};

const salaryText = (amount) => (amount === null || amount === undefined ? "No salary set" : `৳${Number(amount).toLocaleString("en-IN")} salary`);

const iconButton =
  "inline-flex size-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20";

// One line of info with its icon
const Info = ({ icon, children }) => {
  const IconTag = icon;
  return (
    <p className="flex items-start gap-2 text-sm text-slate-700">
      <IconTag className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="min-w-0 break-all">{children}</span>
    </p>
  );
};

// The staff list on phones: one card per person (the table takes over from sm). Same look as the branch cards:
// avatar, name, status · ID and edit / delete on top; role and branch; contact and pay in a soft box;
// dashboard and permissions as chips; "Login as" at the bottom for people this admin can manage.
const StaffCards = ({ staff, loading, actor, enteringId, onLoginAs, onEdit, onDelete, onViewPermissions }) => {
  if (loading) {
    return (
      <div className="flex justify-center rounded-2xl bg-white py-16 shadow-sm ring-1 ring-slate-200/80">
        <Spinner className="h-6 w-6 text-brand" />
      </div>
    );
  }

  if (staff.length === 0) {
    return <p className="rounded-2xl bg-white px-4 py-16 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">No staff found.</p>;
  }

  return (
    <ul className="space-y-3">
      {staff.map((s) => {
        const manageable = canManageUser(actor, s);
        const isYou = s._id === actor._id;
        const branchRole = isBranchRole(s.role);
        const dashboard = !branchRole || s.permissions.includes("dashboard.view");

        return (
          <li key={s._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className="p-4">
              {/* Avatar, name, status · ID, and edit / delete */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold tracking-wide ring-1 ring-inset ${
                    s.isActive ? "bg-slate-100 text-slate-700 ring-slate-200" : "bg-slate-50 text-slate-400 ring-slate-100"
                  }`}
                  aria-hidden="true"
                >
                  {initialsOf(s.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 break-words font-semibold leading-snug text-slate-900" title={s.name}>
                    {s.name}
                    {isYou && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`inline-flex items-center gap-1 font-medium ${s.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                      <span className={`size-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                    {s.staffCode && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono font-semibold text-blue-700">#{s.staffCode}</span>
                      </>
                    )}
                  </p>
                </div>
                {manageable && (
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(s)}
                      aria-label={`Edit ${s.name}`}
                      title="Edit"
                      className={`${iconButton} bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900`}
                    >
                      <LuPencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(s)}
                      aria-label={`Delete ${s.name}`}
                      title="Delete"
                      className={`${iconButton} bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600`}
                    >
                      <LuTrash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Role and branch */}
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <Badge tone={ROLE_TONES[s.role] || "slate"} className="whitespace-nowrap">
                  {ROLE_LABELS[s.role] || s.role}
                </Badge>
                <span className="text-slate-300">·</span>
                {s.branch ? (
                  <span className="min-w-0 break-words text-slate-700">{s.branch.name}</span>
                ) : branchRole ? (
                  <span className="font-medium text-red-600">No branch assigned</span>
                ) : (
                  <span className="text-slate-500">All branches</span>
                )}
              </div>

              {/* Contact and pay */}
              <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 px-3 py-2.5">
                <Info icon={LuPhone}>
                  <a href={`tel:${s.phone}`} className="tabular-nums hover:underline">
                    {formatPhone(s.phone)}
                  </a>
                </Info>
                {s.email && <Info icon={LuMail}>{s.email}</Info>}
                <Info icon={LuBanknote}>{salaryText(s.salary)}</Info>
              </div>

              {/* Access */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    dashboard ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-slate-500 ring-slate-200"
                  }`}
                >
                  <LuLayoutDashboard className="size-3.5" aria-hidden="true" />
                  Dashboard {dashboard ? "allowed" : "hidden"}
                </span>
                <button
                  type="button"
                  onClick={() => onViewPermissions(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50"
                >
                  <LuShieldCheck className="size-3.5" aria-hidden="true" />
                  {branchRole ? `${s.permissions.length} permission${s.permissions.length === 1 ? "" : "s"}` : "Full access"}
                </button>
              </div>
            </div>

            {/* Main action */}
            {manageable ? (
              <button
                type="button"
                onClick={() => onLoginAs(s)}
                disabled={!s.isActive || Boolean(enteringId)}
                className="group flex w-full items-center gap-2 border-t border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:bg-blue-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LuLogIn className="size-4" aria-hidden="true" />
                {enteringId === s._id ? "Opening..." : s.isActive ? `Login as ${s.name.split(" ")[0]}` : "Inactive staff can't be logged in as"}
                {s.isActive && <LuArrowRight className="ml-auto size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />}
              </button>
            ) : (
              !isYou && <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">Only the owner can manage this account</p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default StaffCards;
