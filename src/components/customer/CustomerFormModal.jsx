import { useId, useState } from "react";
import { BALANCE_TYPE, CUSTOMER_STATUS } from "../../constants/customer";
import { useCreateCustomer, useUpdateCustomer } from "../../hooks/useCustomerApi";
import { fromE164, toE164, validateBdMobile } from "../../utils/phone";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import PhoneInput from "../common/forms/PhoneInput";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: CUSTOMER_STATUS.ACTIVE, label: "Active" },
  { value: CUSTOMER_STATUS.INACTIVE, label: "Inactive" },
];

const BALANCE_TYPE_OPTIONS = [
  { value: BALANCE_TYPE.TO_PAY, label: "To Pay (কাস্টমার আমাকে দিবে)" },
  { value: BALANCE_TYPE.TO_RECEIVE, label: "To Receive (আমি কাস্টমারকে দিব)" },
];

// Explains the picked balance type under the select
const BALANCE_HINTS = {
  [BALANCE_TYPE.TO_PAY]: { text: "পাওনা — কাস্টমার আপনাকে টাকা দিবে।", className: "border-red-200 bg-red-50 text-red-700" },
  [BALANCE_TYPE.TO_RECEIVE]: { text: "দেনা — আপনি কাস্টমারকে টাকা দিবেন।", className: "border-green-200 bg-green-50 text-green-700" },
};

// The saved signed opening balance is shown as type + amount
const toForm = (customer) => ({
  name: customer?.name || "",
  phone: fromE164(customer?.phone),
  address: customer?.address || "",
  balanceType: customer?.openingBalance < 0 ? BALANCE_TYPE.TO_RECEIVE : BALANCE_TYPE.TO_PAY,
  initialBalance: customer?.openingBalance ? String(Math.abs(customer.openingBalance)) : "",
  status: customer?.status || CUSTOMER_STATUS.ACTIVE,
});

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  phone: validateBdMobile(form.phone),
  address: form.address.trim() ? "" : "Address is required",
  initialBalance: form.initialBalance === "" || Number(form.initialBalance) >= 0 ? "" : "Enter an amount of 0 or more",
});

// customer: the customer to edit, or null to create one
const CustomerFormModal = ({ customer, onClose, onSaved }) => {
  const isEdit = Boolean(customer);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(customer));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const submitting = createCustomer.isPending || updateCustomer.isPending;
  const hint = BALANCE_HINTS[form.balanceType];

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const payload = {
      name: form.name.trim(),
      phone: toE164(form.phone),
      address: form.address.trim(),
      balanceType: form.balanceType,
      initialBalance: Number(form.initialBalance) || 0,
      status: form.status,
    };

    try {
      const saved = isEdit
        ? await updateCustomer.mutateAsync({ id: customer._id, data: payload })
        : await createCustomer.mutateAsync(payload);
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
      title={isEdit ? "Update Customer" : "Create Customer"}
      subtitle={isEdit ? customer.name : "Add a customer you sell to"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Customer" : "Create Customer"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Customer Information" icon="user">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter customer name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setField("phone", v)} error={errors.phone} />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
            <Input
              label="Address"
              name="address"
              required
              placeholder="Enter customer address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection
          title="Opening Balance"
          description={isEdit ? "Changing it moves the current balance by the same difference" : "Money already owed when you add this customer"}
          icon="settings"
          muted
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Select
                label="Balance Type / ব্যালেন্স টাইপ"
                name="balanceType"
                options={BALANCE_TYPE_OPTIONS}
                value={form.balanceType}
                onChange={handleChange}
              />
              <p className={`mt-2 rounded-md border px-3 py-1.5 text-xs ${hint.className}`}>{hint.text}</p>
            </div>
            <Input
              label="Initial Balance (৳)"
              name="initialBalance"
              inputMode="decimal"
              placeholder="Enter amount"
              value={form.initialBalance}
              // Digits and one decimal point only
              onChange={(e) => setField("initialBalance", e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))}
              error={errors.initialBalance}
            />
          </div>
        </FormSection>
      </form>
    </Modal>
  );
};

export default CustomerFormModal;
