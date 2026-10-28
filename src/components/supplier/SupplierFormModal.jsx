import { useId, useState } from "react";
import { BALANCE_TYPE, SUPPLIER_STATUS } from "../../constants/supplier";
import { useCreateSupplier, useUpdateSupplier } from "../../hooks/useSupplierApi";
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
  { value: SUPPLIER_STATUS.ACTIVE, label: "Active" },
  { value: SUPPLIER_STATUS.INACTIVE, label: "Inactive" },
];

const BALANCE_TYPE_OPTIONS = [
  { value: BALANCE_TYPE.TO_PAY, label: "To Pay (আমি সাপ্লায়ারকে টাকা দিব)" },
  { value: BALANCE_TYPE.TO_RECEIVE, label: "To Receive (সাপ্লায়ার আমাকে টাকা দিবে)" },
];

// Explains the picked balance type under the select
const BALANCE_HINTS = {
  [BALANCE_TYPE.TO_PAY]: { text: "আমি সাপ্লায়ারকে টাকা দিব।", className: "border-green-200 bg-green-50 text-green-700" },
  [BALANCE_TYPE.TO_RECEIVE]: { text: "সাপ্লায়ার আমাকে টাকা দিবে।", className: "border-red-200 bg-red-50 text-red-700" },
};

// The saved signed opening balance is shown as type + amount
const toForm = (supplier) => ({
  name: supplier?.name || "",
  phone: fromE164(supplier?.phone),
  address: supplier?.address || "",
  balanceType: supplier?.openingBalance < 0 ? BALANCE_TYPE.TO_RECEIVE : BALANCE_TYPE.TO_PAY,
  initialBalance: supplier?.openingBalance ? String(Math.abs(supplier.openingBalance)) : "",
  status: supplier?.status || SUPPLIER_STATUS.ACTIVE,
});

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  phone: validateBdMobile(form.phone),
  address: form.address.trim() ? "" : "Address is required",
  initialBalance: form.initialBalance === "" || Number(form.initialBalance) >= 0 ? "" : "Enter an amount of 0 or more",
});

// supplier: the supplier to edit, or null to create one
const SupplierFormModal = ({ supplier, onClose, onSaved }) => {
  const isEdit = Boolean(supplier);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(supplier));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const submitting = createSupplier.isPending || updateSupplier.isPending;
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
        ? await updateSupplier.mutateAsync({ id: supplier._id, data: payload })
        : await createSupplier.mutateAsync(payload);
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
      title={isEdit ? "Update Supplier" : "Create Supplier"}
      subtitle={isEdit ? supplier.name : "Add a supplier you buy products from"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Supplier" : "Create Supplier"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Supplier Information" icon="user">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter supplier name"
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
              placeholder="Enter supplier address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection
          title="Opening Balance"
          description={isEdit ? "Changing it moves the current balance by the same difference" : "Money already owed when you add this supplier"}
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

export default SupplierFormModal;
