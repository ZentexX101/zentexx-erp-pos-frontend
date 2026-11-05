import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Pagination from "../../components/common/data/Pagination";
import Input from "../../components/common/forms/Input";
import Select from "../../components/common/forms/Select";
import PageHeader from "../../components/common/layout/PageHeader";
import Modal from "../../components/common/modals/Modal";
import PersonLink from "../../components/hr/PersonLink";
import PaymentMethodLines from "../../components/payment/PaymentMethodLines";
import { useAuth } from "../../hooks/useAuth";
import { useAdvancesData, useGiveAdvance, usePayrollData } from "../../hooks/useHrApi";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { hasPermission } from "../../utils/access";
import { formatDateTime } from "../../utils/formatDate";
import { currentMonth } from "../../utils/hr";
import { formatTaka } from "../../utils/money";
import { newPaymentLine, paymentLinesError, toPaymentItems } from "../../utils/paymentLines";

const GiveAdvanceModal = ({ staff, methods, onClose, onSave, saving }) => {
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const [user, setUser] = useState("");
  const [lines, setLines] = useState([{ ...newPaymentLine(), paymentMethod: defaultMethod?._id ?? "" }]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const save = async () => {
    if (!user) return setError("Pick a staff member.");
    const problem = paymentLinesError(lines, methods, { checkBalance: true });
    if (problem) return setError(problem);
    try {
      await onSave({ user, payments: toPaymentItems(lines), note: note.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Give advance"
      subtitle="It can be taken back from their next salary"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Give advance
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
        <PaymentMethodLines
          lines={lines}
          onChange={setLines}
          methods={methods}
          checkBalance
          title="Pay from"
          addLabel="Add Method"
          totalLabel="Advance"
          tone="text-amber-700"
        />
        <Input label="Note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
};

// Advance salary: who still owes what, and every advance given
const Advances = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "hr.manage");

  // all states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [giving, setGiving] = useState(false);

  // call hr api (paging runs on the backend)
  const { data, isLoading, error } = useAdvancesData({ page, limit });
  const { data: payroll } = usePayrollData(currentMonth());
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const give = useGiveAdvance();
  const rows = data?.data ?? [];
  const balances = data?.meta?.balances ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Advance Salary"
        subtitle="Money paid ahead, taken back from the salary when you pay it"
        actions={canManage && <Button onClick={() => setGiving(true)}>Give advance</Button>}
      />

      <Alert>{error?.message}</Alert>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Still to come back</h2>
          <span className="text-lg font-bold tabular-nums text-amber-700">{formatTaka(data?.meta?.summary?.outstanding ?? 0)}</span>
        </div>
        {balances.length === 0 ? (
          <p className="pt-3 text-sm text-slate-500">Nobody owes any advance.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {balances.map((row) => (
              <li key={row.user._id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <PersonLink person={row.user} />
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <h2 className="border-b border-slate-100 px-5 py-3.5 font-semibold text-slate-900">Advances given</h2>
        {isLoading && !data ? (
          <div className="h-40 animate-pulse bg-slate-100" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No advance given yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row._id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <PersonLink person={row.user} />
                </div>
                <div className="min-w-0 text-sm text-slate-500 sm:text-right">
                  <span className="block font-mono text-xs">{row.advanceNo}</span>
                  <span className="block">{formatDateTime(row.date)}</span>
                  {row.note && (
                    <span className="block truncate" title={row.note}>
                      {row.note}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900 sm:w-32 sm:text-right">{formatTaka(row.amount)}</span>
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

      {giving && (
        <GiveAdvanceModal
          staff={payroll?.rows ?? []}
          methods={methods}
          onClose={() => setGiving(false)}
          onSave={(values) => give.mutateAsync(values)}
          saving={give.isPending}
        />
      )}
    </div>
  );
};

export default Advances;
