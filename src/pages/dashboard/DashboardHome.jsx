import { ROLE_LABELS } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";
import { formatPhone } from "../../utils/phone";

// Placeholder until the Dashboard Overview module (summary cards, charts) is built
const DashboardHome = () => {
  const { user } = useAuth();

  const details = [
    ["Phone", formatPhone(user.phone)],
    ["Email", user.email || "—"],
    ["Type", ROLE_LABELS[user.role] || user.role],
    ["Last login", user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
      <p className="mt-1 text-sm text-slate-500">You're signed in to Zentexx ERP.</p>

      <dl className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default DashboardHome;
