import { useId, useState } from "react";
import { BRAND_STATUS } from "../../constants/brand";
import { useCreateBrand, useUpdateBrand } from "../../hooks/useBrandApi";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: BRAND_STATUS.ACTIVE, label: "Active" },
  { value: BRAND_STATUS.INACTIVE, label: "Inactive" },
];

const toForm = (brand) => ({
  name: brand?.name || "",
  status: brand?.status || BRAND_STATUS.ACTIVE,
});

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
});

// brand: the brand to edit, or null to create one
const BrandFormModal = ({ brand, onClose, onSaved }) => {
  const isEdit = Boolean(brand);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(brand));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const submitting = createBrand.isPending || updateBrand.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const payload = { name: form.name.trim(), status: form.status };

    try {
      const saved = isEdit ? await updateBrand.mutateAsync({ id: brand._id, data: payload }) : await createBrand.mutateAsync(payload);
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
      title={isEdit ? "Update Brand" : "Create Brand"}
      subtitle={isEdit ? brand.name : "Add a new product brand"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Brand" : "Create Brand"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Brand Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter brand name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
          </div>
        </FormSection>
      </form>
    </Modal>
  );
};

export default BrandFormModal;
