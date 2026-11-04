import { useState } from "react";
import { COST_KIND_OPTIONS, WARRANTY_PRESETS } from "../../constants/repair";
import { formatTaka } from "../../utils/money";
import { jobFormError, toJobPayload } from "../../utils/repair";
import { roundTaka, toDecimalInput, toIntegerInput } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import PaymentMethodLines from "../payment/PaymentMethodLines";
import { RepairDeviceFields, RepairPromiseFields, RepairTechnicianFields } from "./RepairJobFields";

// Runs the page's save, showing any refusal inside the modal
const useSubmit = (onSubmit) => {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const run = async (data) => {
    setError("");
    setSaving(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return { error, setError, saving, run };
};

const Footer = ({ formId, label, saving, onClose, danger }) => (
  <div className="flex justify-end gap-2">
    <Button variant="secondary" onClick={onClose}>
      Back
    </Button>
    <Button type="submit" form={formId} loading={saving} variant={danger ? "danger" : "primary"}>
      {label}
    </Button>
  </div>
);

// A part or outside work paid for the job
export const RepairCostModal = ({ methods, onClose, onSubmit }) => {
  const [form, setForm] = useState({ kind: "part", label: "", amount: "", paymentMethod: "" });
  const { error, setError, saving, run } = useSubmit(onSubmit);
  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const method = methods.find((m) => m._id === form.paymentMethod);
  const short = method && Number(form.amount) > method.balance;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim()) return setError("Say what it was for.");
    if (!(Number(form.amount) > 0)) return setError("Enter the amount.");
    run({ ...form, label: form.label.trim(), amount: Number(form.amount) });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add a cost"
      subtitle="Counted against this job's profit when it closes"
      footer={<Footer formId="repair-cost" label="Add cost" saving={saving} onClose={onClose} />}
    >
      <form id="repair-cost" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <Select label="Type" options={COST_KIND_OPTIONS} value={form.kind} onChange={(e) => set("kind", e.target.value)} />
        <Input
          label="What was it?"
          required
          placeholder="Display, battery..."
          maxLength={120}
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
        />
        <Input label="Amount" required inputMode="decimal" value={form.amount} onChange={(e) => set("amount", toDecimalInput(e.target.value))} />
        <Select
          label="Paid from"
          placeholder="No money moved now"
          options={methods.map((m) => ({ value: m._id, label: `${m.name} (${formatTaka(m.balance)})` }))}
          value={form.paymentMethod}
          onChange={(e) => set("paymentMethod", e.target.value)}
        />
        {short ? (
          <p className="text-sm text-red-600">
            Only {formatTaka(method.balance)} available in {method.name}.
          </p>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-500">
            {form.paymentMethod
              ? "The money leaves this account now."
              : "Pick an account if you paid for this now. Leave it empty if the part was already paid for or will be paid later."}
          </p>
        )}
      </form>
    </Modal>
  );
};

// Another advance from the customer
export const RepairAdvanceModal = ({ methods, onClose, onSubmit }) => {
  const [lines, setLines] = useState(() => [newPaymentLine()]);
  const { error, setError, saving, run } = useSubmit(onSubmit);

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = paymentLinesError(lines, methods, { checkBalance: false });
    if (problem) return setError(problem);
    run({ payments: toPaymentItems(lines) });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Take an advance"
      footer={<Footer formId="repair-advance" label="Save advance" saving={saving} onClose={onClose} />}
    >
      <form id="repair-advance" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <PaymentMethodLines lines={lines} onChange={setLines} methods={methods} title="Advance" addLabel="Add" totalLabel="Advance" tone="text-green-600" />
      </form>
    </Modal>
  );
};

// Corrects an open job's details
export const RepairEditModal = ({ job, staff, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    deviceName: job.deviceName,
    imei: job.imei ?? "",
    color: job.color ?? "",
    accessories: job.accessories,
    problem: job.problem,
    condition: job.condition ?? "",
    technicianType: job.technicianType,
    technician: job.technician?._id ?? "",
    outsideName: job.outsideName ?? "",
    estimate: job.estimate ? String(job.estimate) : "",
    promisedDate: job.promisedDate ? new Date(job.promisedDate).toLocaleDateString("en-CA") : "",
  });
  const { error, setError, saving, run } = useSubmit(onSubmit);
  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = jobFormError(form);
    if (problem) return setError(problem);
    run(toJobPayload(form));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={`Edit ${job.repairNo}`}
      footer={<Footer formId="repair-edit" label="Save changes" saving={saving} onClose={onClose} />}
    >
      <form id="repair-edit" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <RepairDeviceFields form={form} onField={set} />
        <RepairTechnicianFields form={form} onField={set} staff={staff} />
        <RepairPromiseFields form={form} onField={set} />
      </form>
    </Modal>
  );
};

const SummaryRow = ({ label, value, strong, tone = "text-slate-900" }) => (
  <p className={`flex items-center justify-between gap-3 text-sm ${strong ? "font-semibold" : ""}`}>
    <span className="text-slate-600">{label}</span>
    <span className={`font-semibold tabular-nums ${tone}`}>{value}</span>
  </p>
);

// Delivers or cancels the job, settling its money. The final charge decides what's still to pay or give back.
export const RepairCloseModal = ({ job, outcome, methods, onClose, onSubmit }) => {
  const delivered = outcome === "delivered";
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const [charge, setCharge] = useState(delivered && job.estimate ? String(job.estimate) : "0");
  const [warrantyDays, setWarrantyDays] = useState("0");
  const [note, setNote] = useState("");
  const [refundMethod, setRefundMethod] = useState(defaultMethod?._id ?? "");
  // null = follow what's left to pay on the default method; a list once edited
  const [editedLines, setEditedLines] = useState(null);
  const { error, setError, saving, run } = useSubmit(onSubmit);

  const amount = Number(charge) || 0;
  const toPay = Math.max(roundTaka(amount - job.paidAmount), 0);
  const refund = Math.max(roundTaka(job.paidAmount - amount), 0);
  const lines = editedLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: toPay ? String(toPay) : "" }];
  const paidNow = toPay > 0 ? paymentLinesTotal(lines) : 0;
  const due = roundTaka(toPay - paidNow);
  const refundFrom = methods.find((m) => m._id === refundMethod);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filled = toPay > 0 ? lines.filter((line) => line.paymentMethod || Number(line.amount) > 0) : [];
    const problem =
      (filled.length > 0 && paymentLinesError(filled, methods, { checkBalance: false })) ||
      (paidNow > toPay && `Only ${formatTaka(toPay)} is left to pay.`) ||
      (due > 0 && !job.customer && "A walk-in customer must pay in full.") ||
      (refund > 0 && !refundMethod && "Pick the account to refund from.") ||
      (refund > 0 && refundFrom && refund > refundFrom.balance && `"${refundFrom.name}" doesn't have ${formatTaka(refund)}.`);
    if (problem) return setError(problem);
    run({
      outcome,
      charge: amount,
      payments: toPaymentItems(filled.filter((line) => Number(line.amount) > 0)),
      refundMethod: refund > 0 ? refundMethod : "",
      warrantyDays: delivered ? Number(warrantyDays) || 0 : 0,
      note: note.trim(),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={delivered ? "Deliver the device" : "Cancel this job"}
      subtitle={`${job.repairNo} · ${job.deviceName} · ${job.customerName}`}
      footer={<Footer formId="repair-close" label={delivered ? "Deliver" : "Cancel job"} saving={saving} onClose={onClose} danger={!delivered} />}
    >
      <form id="repair-close" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <Input
          label={delivered ? "Final charge" : "Checking fee (0 if none)"}
          required
          inputMode="decimal"
          value={charge}
          onChange={(e) => setCharge(toDecimalInput(e.target.value))}
        />

        {toPay > 0 && (
          <PaymentMethodLines
            lines={lines}
            onChange={setEditedLines}
            methods={methods}
            title="Payment"
            addLabel="Add"
            totalLabel="Paying now"
            tone="text-green-600"
          />
        )}

        {refund > 0 && (
          <Select
            label={`Refund ${formatTaka(refund)} from`}
            required
            options={methods.map((m) => ({ value: m._id, label: `${m.name} (${formatTaka(m.balance)})` }))}
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
          />
        )}

        {delivered && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Warranty on the repair</p>
            <div className="flex flex-wrap items-center gap-2">
              {WARRANTY_PRESETS.map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={warrantyDays === String(days)}
                  onClick={() => setWarrantyDays(String(days))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${warrantyDays === String(days) ? "bg-slate-100 text-slate-900 ring-slate-400" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"}`}
                >
                  {days ? `${days} days` : "None"}
                </button>
              ))}
              <input
                aria-label="Warranty days"
                inputMode="numeric"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(toIntegerInput(e.target.value))}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
              />
            </div>
          </div>
        )}

        <Textarea
          label={delivered ? "Note (optional)" : "Why was it cancelled? (optional)"}
          rows={2}
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="space-y-1.5 rounded-xl bg-slate-50 p-4">
          <SummaryRow label={delivered ? "Charge" : "Fee"} value={formatTaka(amount)} />
          <SummaryRow label="Advance already paid" value={formatTaka(job.paidAmount)} />
          {refund > 0 && <SummaryRow label="Refund to the customer" value={formatTaka(refund)} tone="text-amber-700" strong />}
          {toPay > 0 && <SummaryRow label="Paying now" value={formatTaka(paidNow)} tone="text-emerald-700" />}
          {due > 0 && <SummaryRow label="Stays as due" value={formatTaka(due)} tone="text-red-600" strong />}
          {job.costTotal !== undefined && (
            <div className="mt-2 border-t border-slate-200 pt-2">
              <SummaryRow
                label={`Job cost ${formatTaka(job.costTotal)}, so profit`}
                value={formatTaka(roundTaka(amount - job.costTotal))}
                tone={amount - job.costTotal < 0 ? "text-red-600" : "text-emerald-700"}
                strong
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
