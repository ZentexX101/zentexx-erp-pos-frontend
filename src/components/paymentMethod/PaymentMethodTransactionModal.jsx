import { useId, useState } from "react";
import { usePaymentMethodTransaction } from "../../hooks/usePaymentMethodApi";
import { formatTaka } from "../../utils/money";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";

const COPY = {
  in: { title: "Cash In", subtitle: "Put money into", button: "Add Money", tone: "text-green-600" },
  out: { title: "Cash Out", subtitle: "Take money out of", button: "Take Out", tone: "text-red-600" },
};

// Digits and one decimal point only
const toDecimal = (value) => value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

// The "In" / "Out" buttons: direction is "in" or "out". Shows the balance before and after.
const PaymentMethodTransactionModal = ({ paymentMethod, direction, onClose, onSaved }) => {
  const formId = useId();
  const copy = COPY[direction];
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const transaction = usePaymentMethodTransaction();

  const value = Number(amount) || 0;
  const balanceAfter = paymentMethod.balance + (direction === "in" ? value : -value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (value <= 0) return setError("Enter an amount more than 0");
    if (balanceAfter < 0) return setError(`Only ${formatTaka(paymentMethod.balance)} is available`);

    try {
      const saved = await transaction.mutateAsync({ id: paymentMethod._id, direction, data: { amount: value, note: note.trim() } });
      onSaved(saved, direction, value);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={copy.title}
      subtitle={`${copy.subtitle} ${paymentMethod.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={transaction.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={transaction.isPending} className="min-w-32">
            {copy.button}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert>{serverError}</Alert>

        <Input
          label="Amount (৳)"
          required
          autoFocus
          inputMode="decimal"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => {
            setAmount(toDecimal(e.target.value));
            setError("");
          }}
          error={error}
        />
        <Textarea label="Note" placeholder="Why the money moved (optional)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />

        <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Current balance</dt>
            <dd className="font-semibold text-slate-900">{formatTaka(paymentMethod.balance)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">After this</dt>
            <dd className={`font-semibold ${balanceAfter < 0 ? "text-red-600" : copy.tone}`}>{formatTaka(balanceAfter)}</dd>
          </div>
        </dl>
      </form>
    </Modal>
  );
};

export default PaymentMethodTransactionModal;
