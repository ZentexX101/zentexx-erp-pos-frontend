import { useId, useState } from "react";
import { CUSTOMER_PAYMENT_KINDS } from "../../constants/customerPayment";
import { useCreateCustomerPayment } from "../../hooks/useCustomerPaymentApi";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { customerBalanceMeaning } from "../../utils/customer";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import CustomerBalance from "../customer/CustomerBalance";
import CustomerSelect from "../customer/CustomerSelect";
import PaymentMethodLines from "../payment/PaymentMethodLines";

// kind "payment": take money from a customer; "payout": pay money to one.
// Both can be split over several payment methods; a payout checks each method's balance.
const CustomerPaymentFormModal = ({ kind, onClose, onSaved }) => {
  const copy = CUSTOMER_PAYMENT_KINDS[kind];
  const formId = useId();
  const [customer, setCustomer] = useState(null);
  const [lines, setLines] = useState(() => [newPaymentLine()]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const createPayment = useCreateCustomerPayment(kind);

  const total = paymentLinesTotal(lines);
  const due = copy.dueOf(customer);

  const changeLines = (next) => {
    setError("");
    setLines(next);
  };

  // Puts the whole due on the first line (picking the default method if none is chosen)
  const fillDue = () =>
    changeLines([
      { ...lines[0], amount: String(due), paymentMethod: lines[0].paymentMethod || methods.find((m) => m.isDefault)?._id || "" },
      ...lines.slice(1).map((line) => ({ ...line, amount: "" })),
    ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = (!customer && "Select a customer.") || paymentLinesError(lines, methods, { checkBalance: copy.checkBalance });
    if (problem) return setError(problem);

    try {
      const saved = await createPayment.mutateAsync({ customer: customer._id, payments: toPaymentItems(lines), note: note.trim() });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={kind === "payment" ? "Create Customer Payment" : "Create Customer Payment Out (Payout)"}
      subtitle={copy.formSubtitle}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createPayment.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createPayment.isPending} disabled={total <= 0} className="min-w-52">
            {copy.submitLabel} ({formatTaka(total)})
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{error}</Alert>

        <FormSection title={kind === "payment" ? "Customer Details" : "Customer Payout Information"} icon="user">
          <CustomerSelect value={customer} onChange={setCustomer} />
          {customer && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span>
                Current balance: <CustomerBalance amount={customer.balance} />{" "}
                <span className="text-xs text-slate-500">({customerBalanceMeaning(customer.balance)})</span>
              </span>
              {due > 0 && (
                <button type="button" onClick={fillDue} className="text-xs font-semibold text-indigo-600 hover:underline">
                  {copy.dueLabel} {formatTaka(due)}
                </button>
              )}
            </div>
          )}
        </FormSection>

        <PaymentMethodLines
          lines={lines}
          onChange={changeLines}
          methods={methods}
          checkBalance={copy.checkBalance}
          title={copy.linesTitle}
          addLabel={copy.addLabel}
          totalLabel={copy.totalLabel}
          tone={copy.tone}
          footer={
            due > 0 &&
            total > due && (
              <span className="text-xs text-amber-700">
                {formatTaka(roundTaka(total - due))} more than {kind === "payment" ? "the due — kept as the customer's advance" : "what we owe — the customer will owe it back"}
              </span>
            )
          }
        />

        <Textarea
          label={kind === "payment" ? "Note / Remark" : "Note / Reference"}
          placeholder={copy.notePlaceholder}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
};

export default CustomerPaymentFormModal;
