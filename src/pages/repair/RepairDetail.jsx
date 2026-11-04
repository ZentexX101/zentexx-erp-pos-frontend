import { useCallback, useState } from "react";
import { LuArrowLeft, LuPencil, LuPhone, LuPlus, LuPrinter, LuTrash2 } from "react-icons/lu";
import { Link, useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Badge from "../../components/common/data/Badge";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { EarlierRepairs } from "../../components/repair/RepairDeviceNote";
import { RepairAdvanceModal, RepairCloseModal, RepairCostModal, RepairEditModal } from "../../components/repair/RepairModals";
import RepairSlip from "../../components/repair/RepairSlip";
import RepairStepper from "../../components/repair/RepairStepper";
import { COST_KINDS, OPEN_STATUSES, REPAIR_STATUS } from "../../constants/repair";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import {
  useAddRepairCost,
  useAddRepairPayment,
  useCloseRepair,
  useRemoveRepairCost,
  useRepairData,
  useRepairDevice,
  useRepairOptions,
  useUpdateRepair,
  useUpdateRepairStatus,
} from "../../hooks/useRepairApi";
import { hasPermission } from "../../utils/access";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { formatPhone } from "../../utils/phone";

// The next step's button on an open job
const NEXT_STEP = {
  received: { status: "repairing", label: "Start repair" },
  repairing: { status: "ready", label: "Mark as ready" },
};
const PREVIOUS_STEP = { repairing: "received", ready: "repairing" };

const Card = ({ title, action, children }) => (
  <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
    <div className="px-5 py-4">{children}</div>
  </section>
);

const Fact = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{children}</dd>
  </div>
);

const MoneyRow = ({ label, value, tone = "text-slate-900", strong }) => (
  <div className={`flex items-center justify-between gap-3 py-1.5 text-sm ${strong ? "font-semibold" : ""}`}>
    <span className="text-slate-600">{label}</span>
    <span className={`font-semibold tabular-nums ${tone}`}>{formatTaka(value)}</span>
  </div>
);

const SmallAction = ({ icon, children, ...props }) => {
  const Icon = icon;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
      {...props}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </button>
  );
};

// Everything that happened on the job, newest first: steps, money in and money spent
const activityOf = (job) =>
  [
    ...job.history.map((row) => ({ date: row.date, by: row.by?.name, title: REPAIR_STATUS[row.status].label, note: row.note, dot: "bg-slate-400" })),
    ...job.payments.map((row) => ({
      date: row.date,
      by: row.by?.name,
      title: `${row.stage === "advance" ? "Advance" : "Payment"} ${formatTaka(row.amount)}`,
      note: row.paymentMethod?.name,
      dot: "bg-emerald-500",
    })),
    ...(job.costs ?? []).map((row) => ({
      date: row.date,
      by: row.by?.name,
      title: `Cost ${formatTaka(row.amount)}: ${row.label}`,
      note: row.paymentMethod?.name,
      dot: "bg-amber-500",
    })),
    ...(job.refundAmount > 0 ? [{ date: job.closedAt, title: `Refund ${formatTaka(job.refundAmount)}`, note: job.refundMethod?.name, dot: "bg-red-500" }] : []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

// One job from start to finish: where it stands, the device, its money, its costs and everything that happened
const RepairDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canEdit = hasPermission(user, "repair.edit");

  // all states
  const [modal, setModal] = useState(null); // cost | advance | edit | delivered | cancelled
  const [removing, setRemoving] = useState(null);
  const [printing, setPrinting] = useState(null);
  const [error, setError] = useState("");

  // call repair api
  const { data: job, isLoading, error: loadError } = useRepairData(id);
  const { data: device } = useRepairDevice(job?.imei ?? "");
  const { data: options } = useRepairOptions();
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const update = useUpdateRepair();
  const moveStep = useUpdateRepairStatus();
  const addCost = useAddRepairCost();
  const removeCost = useRemoveRepairCost();
  const addPayment = useAddRepairPayment();
  const close = useCloseRepair();
  usePrintWhenReady(
    printing,
    useCallback(() => setPrinting(null), []),
  );

  // Saves from a modal and closes it; a refusal stays in the modal
  const saveFrom = (mutation) => async (data) => {
    await mutation.mutateAsync({ id, data });
    setModal(null);
  };

  const step = async (status) => {
    setError("");
    try {
      await moveStep.mutateAsync({ id, data: { status } });
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmRemove = async () => {
    setError("");
    try {
      await removeCost.mutateAsync({ id, costId: removing._id });
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(null);
    }
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />;
  if (!job) return <Alert>{loadError?.message ?? "Repair job not found."}</Alert>;

  const open = OPEN_STATUSES.includes(job.status);
  const next = NEXT_STEP[job.status];
  const overdue = open && job.promisedDate && new Date(job.promisedDate) < new Date();
  const earlier = (device?.earlier ?? []).filter((row) => row._id !== job._id);
  const leftOnEstimate = Math.max(roundTaka(job.estimate - job.paidAmount), 0);

  return (
    <div>
      <div className="space-y-5 print:hidden">
        <Link to={ROUTES.BRANCH_REPAIRS} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <LuArrowLeft className="size-4" aria-hidden="true" />
          Repairs
        </Link>

        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-500">{job.repairNo}</span>
                <Badge dot tone={REPAIR_STATUS[job.status].tone}>
                  {REPAIR_STATUS[job.status].label}
                </Badge>
                {overdue && <Badge tone="red">Overdue</Badge>}
              </p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{job.deviceName}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Received {formatDateTime(job.receivedAt)}
                {job.createdBy?.name ? ` by ${job.createdBy.name}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setPrinting(job)}>
                <LuPrinter className="size-4" aria-hidden="true" />
                {job.closedAt ? "Print bill" : "Print slip"}
              </Button>
              {canEdit && open && (
                <>
                  {next && (
                    <Button onClick={() => step(next.status)} loading={moveStep.isPending}>
                      {next.label}
                    </Button>
                  )}
                  {job.status === "ready" && <Button onClick={() => setModal("delivered")}>Deliver</Button>}
                </>
              )}
            </div>
          </div>

          <RepairStepper job={job} />

          {canEdit && open && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {PREVIOUS_STEP[job.status] && (
                <SmallAction icon={LuArrowLeft} onClick={() => step(PREVIOUS_STEP[job.status])}>
                  Back to {REPAIR_STATUS[PREVIOUS_STEP[job.status]].label}
                </SmallAction>
              )}
              <SmallAction icon={LuPencil} onClick={() => setModal("edit")}>
                Edit details
              </SmallAction>
              <button
                type="button"
                onClick={() => setModal("cancelled")}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
              >
                Cancel job
              </button>
            </div>
          )}
        </section>

        <Alert>{error}</Alert>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-5">
            <Card title="Device">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Fact label="IMEI">{job.imei ? <span className="font-mono">{job.imei}</span> : "—"}</Fact>
                <Fact label="Color">{job.color || "—"}</Fact>
                <Fact label="Came with">{job.accessories.length ? job.accessories.join(", ") : "Nothing"}</Fact>
                <Fact label="Condition when received">{job.condition || "Not noted"}</Fact>
                <div className="sm:col-span-2">
                  <Fact label="Problem">{job.problem}</Fact>
                </div>
              </dl>
            </Card>

            {job.costs && (
              <Card
                title="Costs"
                action={
                  canEdit &&
                  open && (
                    <SmallAction icon={LuPlus} onClick={() => setModal("cost")}>
                      Add cost
                    </SmallAction>
                  )
                }
              >
                {job.costs.length === 0 ? (
                  <p className="py-3 text-center text-sm text-slate-500">No parts or outside work yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {job.costs.map((cost) => (
                      <li key={cost._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-900">{cost.label}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {COST_KINDS[cost.kind]} · {cost.paymentMethod?.name ?? "No money moved"} · {formatDate(cost.date)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="font-semibold tabular-nums text-slate-900">{formatTaka(cost.amount)}</span>
                          {canEdit && open && (
                            <button
                              type="button"
                              onClick={() => setRemoving(cost)}
                              aria-label={`Remove ${cost.label}`}
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <LuTrash2 className="size-4" aria-hidden="true" />
                            </button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {earlier.length > 0 && (
              <Card title="Earlier repairs of this device">
                <EarlierRepairs jobs={earlier} />
              </Card>
            )}

            <Card title="What happened">
              <ol className="space-y-3">
                {activityOf(job).map((row, index) => (
                  <li key={`${row.title}-${index}`} className="flex gap-3 text-sm">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${row.dot}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900">{row.title}</span>
                      {row.note && <span className="block text-slate-600">{row.note}</span>}
                      <span className="block text-xs text-slate-500">
                        {formatDateTime(row.date)}
                        {row.by ? ` · ${row.by}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card title="Customer">
              <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                {job.customerName}
                <Badge tone={job.customer ? "blue" : "slate"}>{job.customer ? "Saved" : "Walk-in"}</Badge>
              </p>
              <a href={`tel:${job.customerPhone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <LuPhone className="size-3.5" aria-hidden="true" />
                {formatPhone(job.customerPhone)}
              </a>
            </Card>

            <Card title="Work">
              <dl className="grid grid-cols-2 gap-4">
                <Fact label="Technician">
                  {job.technicianType === "outside" ? `${job.outsideName || "Outside"} (outside)` : (job.technician?.name ?? "Not decided")}
                </Fact>
                <Fact label="Promised by">{job.promisedDate ? formatDate(job.promisedDate) : "—"}</Fact>
                {job.warrantyUntil && (
                  <div className="col-span-2">
                    <Fact label="Repair warranty">
                      {job.warrantyDays} days, till {formatDate(job.warrantyUntil)}
                    </Fact>
                  </div>
                )}
              </dl>
            </Card>

            <Card
              title="Money"
              action={
                canEdit &&
                open && (
                  <SmallAction icon={LuPlus} onClick={() => setModal("advance")}>
                    Advance
                  </SmallAction>
                )
              }
            >
              <div className="divide-y divide-slate-100">
                {job.closedAt ? (
                  <>
                    <MoneyRow label={job.status === "cancelled" ? "Fee" : "Charge"} value={job.charge} />
                    <MoneyRow label="Paid" value={job.paidAmount} tone="text-emerald-700" />
                    {job.refundAmount > 0 && <MoneyRow label="Refunded" value={job.refundAmount} tone="text-amber-700" />}
                    {job.dueAmount > 0 && <MoneyRow label="Due" value={job.dueAmount} tone="text-red-600" strong />}
                  </>
                ) : (
                  <>
                    <MoneyRow label="Estimate" value={job.estimate} />
                    <MoneyRow label="Advance paid" value={job.paidAmount} tone="text-emerald-700" />
                    {job.estimate > 0 && <MoneyRow label="Left on the estimate" value={leftOnEstimate} />}
                  </>
                )}
                {job.costTotal !== undefined && <MoneyRow label="Job cost" value={job.costTotal} />}
                {job.closedAt && job.costTotal !== undefined && (
                  <MoneyRow
                    label={job.profit < 0 ? "Loss" : "Profit"}
                    value={Math.abs(job.profit)}
                    tone={job.profit < 0 ? "text-red-600" : "text-emerald-700"}
                    strong
                  />
                )}
              </div>
              {open && job.costTotal !== undefined && <p className="mt-2 text-xs leading-relaxed text-slate-500">Profit counts on the day this job closes.</p>}
            </Card>
          </div>
        </div>
      </div>

      {printing && <RepairSlip job={printing} />}

      {modal === "cost" && <RepairCostModal methods={methods} onClose={() => setModal(null)} onSubmit={saveFrom(addCost)} />}
      {modal === "advance" && <RepairAdvanceModal methods={methods} onClose={() => setModal(null)} onSubmit={saveFrom(addPayment)} />}
      {modal === "edit" && <RepairEditModal job={job} staff={options?.staff ?? []} onClose={() => setModal(null)} onSubmit={saveFrom(update)} />}
      {(modal === "delivered" || modal === "cancelled") && (
        <RepairCloseModal job={job} outcome={modal} methods={methods} onClose={() => setModal(null)} onSubmit={saveFrom(close)} />
      )}
      <ConfirmModal
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title="Remove this cost?"
        message={
          removing?.paymentMethod
            ? `${formatTaka(removing.amount)} goes back to ${removing.paymentMethod.name}.`
            : "It comes off the job's cost. No money moves."
        }
        confirmLabel="Remove"
        danger
      />
    </div>
  );
};

export default RepairDetail;
