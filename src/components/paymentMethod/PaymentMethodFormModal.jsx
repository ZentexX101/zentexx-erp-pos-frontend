import { useId, useState } from "react";
import { PAYMENT_METHOD_STATUS } from "../../constants/paymentMethod";
import { useCreatePaymentMethod, useUpdatePaymentMethod } from "../../hooks/usePaymentMethodApi";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import ToggleField from "../common/forms/ToggleField";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: PAYMENT_METHOD_STATUS.ACTIVE, label: "Active" },
  { value: PAYMENT_METHOD_STATUS.INACTIVE, label: "Inactive" },
];

const toForm = (method) => ({
  name: method?.name || "",
  description: method?.description || "",
  initialBalance: method?.openingBalance ? String(method.openingBalance) : "",
  status: method?.status || PAYMENT_METHOD_STATUS.ACTIVE,
  isDefault: method?.isDefault || false,
});

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  initialBalance: form.initialBalance === "" || Number(form.initialBalance) >= 0 ? "" : "Enter an amount of 0 or more",
});

// Digits and one decimal point only
const toDecimal = (value) => value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

// paymentMethod: the method to edit, or null to create one
const PaymentMethodFormModal = ({ paymentMethod, onClose, onSaved }) => {
  const isEdit = Boolean(paymentMethod);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(paymentMethod));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const submitting = createPaymentMethod.isPending || updatePaymentMethod.isPending;
  const inactive = form.status === PAYMENT_METHOD_STATUS.INACTIVE;

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  // An inactive method can't be the default
  const handleStatus = (e) => {
    setField("status", e.target.value);
    if (e.target.value === PAYMENT_METHOD_STATUS.INACTIVE) setField("isDefault", false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      initialBalance: Number(form.initialBalance) || 0,
      status: form.status,
      isDefault: form.isDefault,
    };

    try {
      const saved = isEdit
        ? await updatePaymentMethod.mutateAsync({ id: paymentMethod._id, data: payload })
        : await createPaymentMethod.mutateAsync(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setServerError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Update Payment Method" : "Create Payment Method"}
      subtitle={isEdit ? paymentMethod.name : "Where this branch keeps money: cash, card, bKash, bank..."}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Payment Method" : "Create Payment Method"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Payment Method Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="e.g. Cash, CARD-DBBL, bKash"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <Textarea
              label="Description"
              name="description"
              placeholder="e.g. POS only, fund transfer"
              maxLength={300}
              value={form.description}
              onChange={handleChange}
              className="sm:col-span-2"
            />
            <div>
              <Input
                label="Initial Balance (৳)"
                name="initialBalance"
                inputMode="decimal"
                placeholder="Enter amount"
                value={form.initialBalance}
                onChange={(e) => setField("initialBalance", toDecimal(e.target.value))}
                error={errors.initialBalance}
              />
              {isEdit && (
                <p className="mt-1 text-xs text-slate-500">Changing it moves the current balance by the same difference.</p>
              )}
            </div>
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleStatus} />
          </div>
        </FormSection>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <ToggleField
            label="Set as Default Payment Method"
            description={
              inactive
                ? "Only an active method can be the default."
                : "Picked automatically in POS sales and exchanges. Only one method can be the default."
            }
            checked={form.isDefault}
            onChange={(value) => setField("isDefault", value)}
            disabled={inactive}
          />
        </div>
      </form>
    </Modal>
  );
};

export default PaymentMethodFormModal;
