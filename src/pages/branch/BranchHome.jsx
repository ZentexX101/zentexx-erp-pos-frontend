import Spinner from "../../components/common/loaders/Spinner";
import { BRANCH_STATUS } from "../../constants/branch";
import { useBranch } from "../../hooks/useBranch";
import { useCurrentBranchData } from "../../hooks/useBranchApi";

// Placeholder for the branch dashboard until Stock, Sales, etc. are built
const BranchHome = () => {
  const { activeBranch } = useBranch();

  // Full details (address, phone, ...) — activeBranch may only have name and status
  const { data: branch, error: queryError } = useCurrentBranchData(activeBranch._id);
  const error = queryError?.message;

  const details = branch && [
    ["Address", branch.address],
    ["Phone", branch.phone],
    ["Email", branch.email || "—"],
    ["Status", branch.status === BRANCH_STATUS.ACTIVE ? "Active" : "Inactive"],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{activeBranch.name}</h1>
      <p className="mt-1 text-sm text-slate-500">Branch dashboard</p>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!branch && !error ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-blue-600" />
        </div>
      ) : (
        details && (
          <dl className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 truncate text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        )
      )}
    </div>
  );
};

export default BranchHome;
