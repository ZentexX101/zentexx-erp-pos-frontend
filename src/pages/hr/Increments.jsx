import { useState } from "react";
import { LuArrowDownRight, LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Pagination from "../../components/common/data/Pagination";
import Input from "../../components/common/forms/Input";
import Select from "../../components/common/forms/Select";
import PageHeader from "../../components/common/layout/PageHeader";
import Modal from "../../components/common/modals/Modal";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import PersonCell from "../../components/hr/PersonCell";
import { useAuth } from "../../hooks/useAuth";
import { useCreateIncrement, useIncrementsData, usePayrollData } from "../../hooks/useHrApi";
import { hasPermission } from "../../utils/access";
import { currentMonth, monthLabel } from "../../utils/hr";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";

// Change one person's salary: pick them, type the new salary, see the difference, choose the first month
const ChangeSalaryModal = ({ staff, onClose, onSave, saving }) => {
  const [user, setUser] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [effectiveMonth, setEffectiveMonth] = useState(currentMonth());
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const person = staff.find((row) => row.user._id === user);
  const difference = person && newSalary !== "" ? Number(newSalary) - person.basic : null;

  const save = async () => {
    if (!user) return setError("Pick a staff member.");
    if (newSalary === "") return setError("Enter the new salary.");
    try {
      await onSave({ user, newSalary: Number(newSalary), effectiveMonth, reason: reason.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Change salary"
      subtitle="The months before it keep the old salary"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Select
          label="Staff member"
          required
          placeholder="Select"
          options={staff.map((row) => ({ value: row.user._id, label: row.user.name }))}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        {person && (
          <p className="text-sm text-slate-600">
            Salary now: <span className="font-semibold text-slate-900">{formatTaka(person.basic)}</span>
          </p>
        )}
        <Input label="New salary" required inputMode="decimal" value={newSalary} onChange={(e) => setNewSalary(toDecimalInput(e.target.value))} />
        {difference !== null && difference !== 0 && (
          <p className={`text-sm font-semibold ${difference > 0 ? "text-emerald-700" : "text-red-600"}`}>
            {difference > 0 ? "+" : "−"} {formatTaka(Math.abs(difference))} a month
          </p>
        )}
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Starts from</p>
          <MonthSwitcher month={effectiveMonth} onChange={setEffectiveMonth} allowFuture />
        </div>
        <Input label="Reason" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  );
};

// Increment: every salary change, newest first
const Increments = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "hr.manage");

  // all states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [changing, setChanging] = useState(false);

  // call hr api (paging runs on the backend)
  const { data, isLoading, error } = useIncrementsData({ page, limit });
  const { data: payroll } = usePayrollData(currentMonth());
  const create = useCreateIncrement();
  const rows = data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Increment"
        subtitle="Every salary change, with what it was before"
        actions={canManage && <Button onClick={() => setChanging(true)}>Change salary</Button>}
      />

      <Alert>{error?.message}</Alert>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No salary change yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => {
              const raise = row.newSalary - row.oldSalary;
              const Arrow = raise >= 0 ? LuArrowUpRight : LuArrowDownRight;
              return (
                <li key={row._id} className="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center">
                  <div className="min-w-0 lg:w-56 lg:shrink-0">
                    <PersonCell person={row.user} />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex flex-wrap items-center gap-2 font-medium tabular-nums text-slate-800">
                      {formatTaka(row.oldSalary)}
                      <LuArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-semibold text-slate-900">{formatTaka(row.newSalary)}</span>
                      <span className={`inline-flex items-center text-xs font-semibold ${raise >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        <Arrow className="size-3.5" aria-hidden="true" />
                        {formatTaka(Math.abs(raise))}
                      </span>
                    </p>
                    {row.reason && (
                      <p className="truncate text-slate-500" title={row.reason}>
                        {row.reason}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-slate-500">From {monthLabel(row.effectiveMonth)}</span>
                </li>
              );
            })}
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

      {changing && (
        <ChangeSalaryModal
          staff={payroll?.rows ?? []}
          onClose={() => setChanging(false)}
          onSave={(values) => create.mutateAsync(values)}
          saving={create.isPending}
        />
      )}
    </div>
  );
};

export default Increments;
