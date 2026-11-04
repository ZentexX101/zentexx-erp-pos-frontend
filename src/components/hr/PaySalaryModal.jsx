import { useState } from "react";
import { formatTaka } from "../../utils/money";
import { monthLabel } from "../../utils/hr";
import { roundTaka, toDecimalInput } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Modal from "../common/modals/Modal";
import PaymentMethodLines from "../payment/PaymentMethodLines";

const Figure = ({ label, value, hint, strong, minus }) => (
  <div className={`flex items-center justify-between gap-3 py-2 text-sm ${strong ? "font-semibold text-slate-900" : "text-slate-700"}`}>
    <span className="min-w-0">
      {label}
      {hint && <span className="block text-xs font-normal text-slate-500">{hint}</span>}
    </span>
    <span className={`shrink-0 tabular-nums ${minus && value > 0 ? "text-red-600" : ""}`}>
      {minus && value > 0 ? "− " : ""}
      {formatTaka(value)}
    </span>
  </div>
);

const EditFigure = ({ label, hint, value, onChange, minus }) => (
  <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-slate-700">
    <span className="min-w-0">
      {minus && <span className="text-red-600">− </span>}
      {label}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </span>
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(toDecimalInput(e.target.value))}
      placeholder="0"
      className="w-28 shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-semibold tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
    />
  </label>
);

const num = (value) => Number(value) || 0;

// Pay one person's month: the salary worked out top to bottom, with the few things a person decides
// (absence, bonus, other deduction, advance to take back) and how it's paid. row: from the Salary page.
const PaySalaryModal = ({ row, methods, onClose, onPay, submitting }) => {
  const [absent, setAbsent] = useState(String(row.absentDeduction));
  const [bonus, setBonus] = useState("");
  const [other, setOther] = useState("");
  const [advance, setAdvance] = useState(String(row.suggestedAdvance || ""));
  const [note, setNote] = useState("");
  const [paymentLines, setPaymentLines] = useState(null); // null = follow the net on the default method
  const [error, setError] = useState("");

  const salaryCost = roundTaka(row.basic - num(absent) + num(bonus) - num(other));
  const net = roundTaka(salaryCost + row.incentive - num(advance));
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const lines = paymentLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: net > 0 ? String(net) : "" }];
  const paid = net > 0 ? paymentLinesTotal(lines) : 0;
  const c = row.counts;

  const submit = async () => {
    const filled = net > 0 ? lines.filter((line) => line.paymentMethod || Number(line.amount) > 0) : [];
    const problem =
      (num(absent) > row.basic && "The absence deduction can't be more than the salary.") ||
      (num(advance) > row.advanceOwed && `Only ${formatTaka(row.advanceOwed)} of advance is owed.`) ||
      (salaryCost < 0 && "Deductions can't be more than the salary and bonus.") ||
      (net < 0 && "The advance taken back can't be more than what's payable.") ||
      (net > 0 && paymentLinesError(filled, methods, { checkBalance: true })) ||
      (paid !== roundTaka(Math.max(net, 0)) && `Pay exactly ${formatTaka(net)}.`);
    if (problem) return setError(problem);
    try {
      await onPay({
        user: row.user._id,
        month: row.month,
        absentDeduction: num(absent),
        bonus: num(bonus),
        otherDeduction: num(other),
        advanceDeducted: num(advance),
        payments: toPaymentItems(filled),
        note: note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Pay ${row.user.name}`}
      subtitle={monthLabel(row.month)}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting}>
            Pay {formatTaka(Math.max(net, 0))}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>

        {c && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{c.present}</span> present · <span className="font-semibold text-slate-900">{c.leave}</span> paid
            leave · <span className="font-semibold text-slate-900">{c.off}</span> off · <span className="font-semibold text-red-600">{c.absent}</span> absent ·{" "}
            <span className="font-semibold text-red-600">{c.unpaidLeave}</span> unpaid leave
            {c.beforeJoining > 0 && <> · {c.beforeJoining} before joining</>}
            {c.upcoming > 0 && <> · {c.upcoming} still to come</>}
          </p>
        )}

        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
          <Figure label="Salary" value={row.basic} />
          <EditFigure
            label="Absence"
            minus
            hint={c ? `${c.deductible} days at ${formatTaka(row.basic / row.daysInMonth)} a day. Change it if needed.` : undefined}
            value={absent}
            onChange={setAbsent}
          />
          <EditFigure label="Bonus" value={bonus} onChange={setBonus} />
          <EditFigure label="Other deduction" minus value={other} onChange={setOther} />
          <Figure label="Incentive" hint="From what they sold this month" value={row.incentive} />
          {row.advanceOwed > 0 && (
            <EditFigure label="Advance taken back" minus hint={`${formatTaka(row.advanceOwed)} is owed`} value={advance} onChange={setAdvance} />
          )}
          <Figure label="To pay" value={Math.max(net, 0)} strong />
        </div>

        {net > 0 && (
          <PaymentMethodLines
            lines={lines}
            onChange={setPaymentLines}
            methods={methods}
            checkBalance
            title="Pay from"
            addLabel="Add Method"
            totalLabel="Paid"
            tone="text-slate-900"
          />
        )}

        <label className="block text-sm font-medium text-slate-700">
          Note
          <input
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
          />
        </label>
      </div>
    </Modal>
  );
};

export default PaySalaryModal;
