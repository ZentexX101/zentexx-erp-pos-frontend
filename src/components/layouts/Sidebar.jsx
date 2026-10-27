import { NavLink, useNavigate } from "react-router";
import { isMainAdmin, REVIEWER_ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";

// Add each new module's page to its panel as it's built; roles limits who sees the item
const NAV_ITEMS = {
  main: [
    { label: "Dashboard", to: ROUTES.DASHBOARD, end: true },
    { label: "Branch", to: ROUTES.BRANCHES },
    { label: "Staff", to: ROUTES.STAFF },
    { label: "Registration Requests", to: ROUTES.REGISTRATIONS, roles: REVIEWER_ROLES },
  ],
  branch: [{ label: "Dashboard", to: ROUTES.BRANCH_HOME, end: true }],
};

// mode: "main" (main admin panel) or "branch" (inside one branch)
const Sidebar = ({ mode, open, onClose }) => {
  const { user } = useAuth();
  const { activeBranch, exitBranch } = useBranch();
  const navigate = useNavigate();

  const items = NAV_ITEMS[mode].filter((item) => !item.roles || item.roles.includes(user.role));

  const goToMainAdmin = () => {
    exitBranch();
    onClose();
    navigate(ROUTES.BRANCHES);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">Z</div>
          <span className="font-semibold text-white">Zentexx ERP</span>
        </div>

        {mode === "branch" && activeBranch && (
          <div className="border-b border-slate-800 px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Branch</p>
            <p className="truncate font-semibold text-emerald-400">{activeBranch.name}</p>
            {isMainAdmin(user) && (
              <button
                type="button"
                onClick={goToMainAdmin}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
              >
                <span aria-hidden="true">←</span> Go to Main Admin
              </button>
            )}
          </div>
        )}

        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
