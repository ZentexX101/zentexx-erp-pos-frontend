import { useId, useState } from "react";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useCreateSupplierPayment } from "../../hooks/useSupplierPaymentApi";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { supplierBalanceMeaning } from "../../utils/supplier";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import PaymentMethodLines from "../payment/PaymentMethodLines";
import SupplierBalance from "../supplier/SupplierBalance";
import SupplierSelect from "../supplier/SupplierSelect";

// Pay a supplier from one or more payment methods (e.g. part cash, part bKash).
// The supplier's due is shown with a one-click "Pay full due".
const SupplierPaymentFormModal = ({ onClose, onSaved }) => {
  const formId = useId();
  const [supplier, setSupplier] = useState(null);
  const [lines, setLines] = useState(() => [newPaymentLine()]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const createPayment = useCreateSupplierPayment();

  const total = paymentLinesTotal(lines);
  const due = supplier?.balance > 0 ? supplier.balance : 0; // positive balance = we owe them

  const changeLines = (next) => {
    setError("");
    setLines(next);
  };

  // Puts the whole due on the first line (picking the default method if none is chosen)
  const payFullDue = () =>
    changeLines([
      { ...lines[0], amount: String(due), paymentMethod: lines[0].paymentMethod || methods.find((m) => m.isDefault)?._id || "" },
      ...lines.slice(1).map((line) => ({ ...line, amount: "" })),
    ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = (!supplier && "Select a supplier.") || paymentLinesError(lines, methods, { checkBalance: true });
    if (problem) return setError(problem);

    try {
      const saved = await createPayment.mutateAsync({ supplier: supplier._id, payments: toPaymentItems(lines), note: note.trim() });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create Supplier Payment"
      subtitle="Pay a supplier from one or more payment methods"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createPayment.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createPayment.isPending} disabled={total <= 0} className="min-w-52">
            Create Supplier Payment ({formatTaka(total)})
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{error}</Alert>

        <FormSection title="Supplier Information" icon="user">
          <SupplierSelect value={supplier} onChange={setSupplier} />
          {supplier && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span>
                Current balance: <SupplierBalance amount={supplier.balance} />{" "}
                <span className="text-xs text-slate-500">({supplierBalanceMeaning(supplier.balance)})</span>
              </span>
              {due > 0 && (
                <button type="button" onClick={payFullDue} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Pay full due {formatTaka(due)}
                </button>
              )}
            </div>
          )}
        </FormSection>

        <PaymentMethodLines
          lines={lines}
          onChange={changeLines}
          methods={methods}
          checkBalance
          title="Payment Methods & Amounts"
          addLabel="Add Payment Method"
          totalLabel="Total Payment"
          footer={
            due > 0 &&
            total > due && <span className="text-xs text-amber-700">{formatTaka(roundTaka(total - due))} more than the due — kept as advance</span>
          }
        />

        <Textarea label="Note" placeholder="Enter payment note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </form>
    </Modal>
  );
};

export default SupplierPaymentFormModal;
