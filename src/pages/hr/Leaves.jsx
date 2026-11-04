import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Badge from "../../components/common/data/Badge";
import Pagination from "../../components/common/data/Pagination";
import PageHeader from "../../components/common/layout/PageHeader";
import LeaveFormModal from "../../components/hr/LeaveFormModal";
import PersonLink from "../../components/hr/PersonLink";
import { LEAVE_STATUS_TONE, leaveTypeLabel } from "../../constants/hr";
import { useAuth } from "../../hooks/useAuth";
import { useAddLeave, useLeavesData, usePayrollData, useReviewLeave } from "../../hooks/useHrApi";
import { hasPermission } from "../../utils/access";
import { currentMonth, shortDayLabel } from "../../utils/hr";

const TABS = [
  { value: "pending", label: "Waiting" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

// Leave requests: the ones waiting come first, one tap to approve or reject
const Leaves = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "hr.manage");

  // all states
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // call hr api (filters and paging run on the backend)
  const { data, isLoading, error: loadError } = useLeavesData({ status, page, limit });
  const { data: payroll } = usePayrollData(currentMonth());
  const review = useReviewLeave();
  const addLeave = useAddLeave();
  const rows = data?.data ?? [];
  const pending = data?.meta?.summary?.pending ?? 0;

  const decide = async (id, next) => {
    setError("");
    try {
      await review.mutateAsync({ id, status: next });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave"
        subtitle="Casual and sick leave are paid. Unpaid leave comes off the salary."
        actions={canManage && <Button onClick={() => setAdding(true)}>Add leave</Button>}
      />

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:inline-flex" role="tablist" aria-label="Status">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition ${status === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {tab.label}
            {tab.value === "pending" && pending > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800">{pending}</span>
            )}
          </button>
        ))}
      </div>

      <Alert>{error || loadError?.message}</Alert>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">{status === "pending" ? "No request is waiting." : "No leave here."}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((leave) => (
              <li key={leave._id} className="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center">
                <div className="min-w-0 lg:w-56 lg:shrink-0">
                  <PersonLink person={leave.user} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-slate-800">
                    {leaveTypeLabel(leave.type)} · {shortDayLabel(leave.from)}
                    {leave.to !== leave.from && ` – ${shortDayLabel(leave.to)}`} · {leave.days} day{leave.days === 1 ? "" : "s"}
                  </p>
                  {leave.reason && (
                    <p className="truncate text-slate-500" title={leave.reason}>
                      {leave.reason}
                    </p>
                  )}
                  {leave.reviewedBy && <p className="text-xs text-slate-400">By {leave.reviewedBy.name}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {leave.status === "pending" && canManage && String(leave.user?._id) !== String(user._id) ? (
                    <>
                      <Button variant="dangerOutline" onClick={() => decide(leave._id, "rejected")}>
                        <LuX className="size-4" aria-hidden="true" />
                        Reject
                      </Button>
                      <Button onClick={() => decide(leave._id, "approved")}>
                        <LuCheck className="size-4" aria-hidden="true" />
                        Approve
                      </Button>
                    </>
                  ) : (
                    <Badge dot tone={LEAVE_STATUS_TONE[leave.status]}>
                      {leave.status}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Pagination
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      {adding && (
        <LeaveFormModal
          isOpen
          onClose={() => setAdding(false)}
          staff={(payroll?.rows ?? []).map((row) => row.user)}
          onSubmit={(form) => addLeave.mutateAsync(form)}
          submitting={addLeave.isPending}
        />
      )}
    </div>
  );
};

export default Leaves;
