import { useId, useState } from "react";
import { CATEGORY_STATUS } from "../../constants/category";
import { categoryService } from "../../services/categoryService";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: CATEGORY_STATUS.ACTIVE, label: "Active" },
  { value: CATEGORY_STATUS.INACTIVE, label: "Inactive" },
];

const toForm = (category) => ({
  name: category?.name || "",
  status: category?.status || CATEGORY_STATUS.ACTIVE,
  incentiveAmount: String(category?.incentiveAmount ?? 0),
});

const validate = (form) => {
  const incentive = Number(form.incentiveAmount);
  return {
    name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
    incentiveAmount: form.incentiveAmount !== "" && incentive >= 0 ? "" : "Enter an amount of 0 or more",
  };
};

// category: the category to edit, or null to create one
const CategoryFormModal = ({ category, onClose, onSaved }) => {
  const isEdit = Boolean(category);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(category));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      status: form.status,
      incentiveAmount: Number(form.incentiveAmount),
    };

    setSubmitting(true);
    try {
      const saved = isEdit ? await categoryService.update(category._id, payload) : await categoryService.create(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Update Category" : "Create Category"}
      subtitle={isEdit ? category.name : "Add a new product category"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Category" : "Create Category"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Category Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter category name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
            <Input
              label="Incentive Amount (৳)"
              name="incentiveAmount"
              inputMode="decimal"
              placeholder="0"
              value={form.incentiveAmount}
              // Digits and one decimal point only
              onChange={(e) => setField("incentiveAmount", e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))}
              error={errors.incentiveAmount}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">Incentive is what a staff member earns for each product of this category they sell.</p>
        </FormSection>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
