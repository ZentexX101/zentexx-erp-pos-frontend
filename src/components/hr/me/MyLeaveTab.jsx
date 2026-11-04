import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { LEAVE_STATUS_TONE, leaveTypeLabel } from "../../../constants/hr";
import { useCancelLeave, useMyLeavesData, useRequestLeave } from "../../../hooks/useHrApi";
import { shortDayLabel } from "../../../utils/hr";
import Button from "../../common/buttons/Button";
import Badge from "../../common/data/Badge";
import Pagination from "../../common/data/Pagination";
import LeaveFormModal from "../LeaveFormModal";

// Every leave a person asked for: the days, the reason, and who decided it
const MyLeaveTab = ({ staffId, today, onError }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [asking, setAsking] = useState(false);
  const { data, isLoading } = useMyLeavesData({ page, limit }, staffId);
  const requestLeave = useRequestLeave();
  const cancelLeave = useCancelLeave();
  const rows = data?.data ?? [];

  const cancel = async (id) => {
    onError("");
    try {
      await cancelLeave.mutateAsync(id);
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <>
      {!staffId && (
        <div className="flex justify-end">
          <Button onClick={() => setAsking(true)}>Ask for leave</Button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">{staffId ? "No leave yet." : "You haven't asked for any leave yet."}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Days</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Decided by</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((leave) => (
                  <tr key={leave._id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-900">
                      {shortDayLabel(leave.from)}
                      {leave.to !== leave.from && ` – ${shortDayLabel(leave.to)}`}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{leave.days}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{leaveTypeLabel(leave.type)}</td>
                    <td className="max-w-56 truncate px-4 py-3 text-slate-500" title={leave.reason ?? undefined}>
                      {leave.reason ?? ""}
                    </td>
                    <td className="px-4 py-3">
                      <Badge dot tone={LEAVE_STATUS_TONE[leave.status]}>
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="max-w-48 truncate px-4 py-3 text-slate-500" title={leave.reviewNote ?? undefined}>
                      {leave.reviewedBy?.name ?? ""}
                      {leave.reviewNote ? `: ${leave.reviewNote}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!staffId && (leave.status === "pending" || (leave.status === "approved" && leave.from > today)) && (
                        <button
                          type="button"
                          onClick={() => cancel(leave._id)}
                          aria-label="Take back"
                          title="Take back"
                          className="rounded p-1 text-slate-400 hover:text-red-600"
                        >
                          <LuTrash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {asking && (
        <LeaveFormModal isOpen onClose={() => setAsking(false)} onSubmit={(form) => requestLeave.mutateAsync(form)} submitting={requestLeave.isPending} />
      )}
    </>
  );
};

export default MyLeaveTab;
