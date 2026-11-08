import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { changeText, changeTone, percentOf, QUICK_RAISES, REASONS } from "../../../utils/increment";
import { currentMonth, monthLabel } from "../../../utils/hr";
import { formatTaka } from "../../../utils/money";
import { roundTaka, toDecimalInput } from "../../../utils/number";
import Alert from "../../common/alerts/Alert";
import Button from "../../common/buttons/Button";
import Input from "../../common/forms/Input";
import Select from "../../common/forms/Select";
import Modal from "../../common/modals/Modal";
import MonthSwitcher from "../MonthSwitcher";

const chip = (selected) =>
  `rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition ${
    selected ? "bg-blue-50 text-blue-700 ring-blue-300" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
  }`;

// The salary the change starts from: an upcoming change already set for that month or earlier wins over today's salary
const baseFor = (row, month) => (row?.upcoming && row.upcoming.effectiveMonth <= month ? row.upcoming.newSalary : (row?.current ?? 0));

// Change one person's salary. rows: the salary overview rows; userId: preselected person (from a row's button).
const ChangeSalaryModal = ({ rows, userId, onClose, onSave, saving }) => {
  const [user, setUser] = useState(userId ?? "");
  const [newSalary, setNewSalary] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const row = rows.find((r) => r.user._id === user);
  const base = baseFor(row, effectiveMonth);
  const next = newSalary === "" ? null : Number(newSalary);
  const difference = next === null ? null : roundTaka(next - base);

  const save = async () => {
    setError("");
    if (!user) return setError("Pick a staff member.");
    if (next === null) return setError("Enter the new salary, or tap a quick raise.");
    if (difference === 0) return setError(`The salary is already ${formatTaka(base)}.`);
    try {
      await onSave({ user, newSalary: next, effectiveMonth, reason: reason.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Change salary"
      subtitle="Months before the start month keep the old salary"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} className="min-w-32">
            Save change
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Alert>{error}</Alert>

        <Select
          label="Staff member"
          required
          placeholder="Select a staff member"
          options={rows.map((r) => ({
            value: r.user._id,
            label: `${r.user.name}${r.user.designation ? ` · ${r.user.designation}` : ""} — ${formatTaka(r.current)}`,
          }))}
          value={user}
          onChange={(e) => {
            setUser(e.target.value);
            setNewSalary("");
          }}
        />

        {row && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">Salary now</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{formatTaka(row.current)}</p>
                {row.last && <p className="text-xs text-slate-500">Last changed {monthLabel(row.last.effectiveMonth)}</p>}
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Starts from</p>
                <MonthSwitcher month={effectiveMonth} onChange={setEffectiveMonth} allowFuture />
              </div>
            </div>
            {row.upcoming && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-100">
                Already set: {formatTaka(row.upcoming.newSalary)} from {monthLabel(row.upcoming.effectiveMonth)}.
              </p>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Quick raise</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_RAISES.map((raise) => {
                  const value = String(raise.apply(base));
                  return (
                    <button key={raise.label} type="button" onClick={() => setNewSalary(value)} className={chip(newSalary === value)}>
                      {raise.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="New salary (per month)"
              required
              inputMode="decimal"
              placeholder="Or type the new salary"
              value={newSalary}
              onChange={(e) => setNewSalary(toDecimalInput(e.target.value))}
            />

            {difference !== null && difference !== 0 && (
              <div className={`rounded-xl px-4 py-3.5 ring-1 ${difference > 0 ? "bg-emerald-50/60 ring-emerald-100" : "bg-red-50/60 ring-red-100"}`}>
                <p className="flex flex-wrap items-center gap-2 text-base font-bold tabular-nums text-slate-900">
                  {formatTaka(base)}
                  <LuArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                  {formatTaka(next)}
                  <span className={`text-sm ${changeTone(difference)}`}>{changeText(difference, percentOf(base, next))}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  From {monthLabel(effectiveMonth)} · {formatTaka(Math.abs(difference) * 12)} a year {difference > 0 ? "more" : "less"}
                </p>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Reason</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {REASONS.map((r) => (
                  <button key={r} type="button" onClick={() => setReason(reason === r ? "" : r)} className={chip(reason === r)}>
                    {r}
                  </button>
                ))}
              </div>
              <Input aria-label="Reason" maxLength={300} placeholder="Or write the reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChangeSalaryModal;
