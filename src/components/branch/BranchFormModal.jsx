import { useId, useState } from "react";
import { BRANCH_STATUS } from "../../constants/branch";
import { useCreateBranch, useUpdateBranch } from "../../hooks/useBranchApi";
import { isValid, validateEmail } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import FormSection from "../common/forms/FormSection";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: BRANCH_STATUS.ACTIVE, label: "Active" },
  { value: BRANCH_STATUS.INACTIVE, label: "Inactive" },
];

const toForm = (branch) => ({
  name: branch?.name || "",
  address: branch?.address || "",
  phone: branch?.phone || "",
  email: branch?.email || "",
  status: branch?.status || BRANCH_STATUS.ACTIVE,
});

const validate = (form) => ({
    name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
    address: form.address.trim() ? "" : "Address is required",
    phone: /^\+?[0-9\s-]{6,20}$/.test(form.phone.trim()) ? "" : "Enter a valid phone number",
    email: form.email.trim() ? validateEmail(form.email) : "",
});

// branch: the branch to edit, or null to create one
const BranchFormModal = ({ branch, onClose, onSaved }) => {
  const isEdit = Boolean(branch);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(branch));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const submitting = createBranch.isPending || updateBranch.isPending;

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
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: form.status,
    };

    try {
      const saved = isEdit
        ? await updateBranch.mutateAsync({ id: branch._id, data: payload })
        : await createBranch.mutateAsync(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      }
      setServerError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Update Branch" : "Create Branch"}
      subtitle={isEdit ? branch.name : "Add a new shop or outlet"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Branch" : "Create Branch"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Branch Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter branch name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <Input
              label="Address"
              name="address"
              required
              placeholder="Enter branch address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              required
              placeholder="Enter branch phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter branch email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
          </div>
        </FormSection>

      </form>
    </Modal>
  );
};

export default BranchFormModal;
