import { useState } from "react";
import { BRANCH_STATUS } from "../../constants/branch";
import { getAssignableRoles, ROLE_LABELS, ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { staffService } from "../../services/staffService";
import { isValid, validateConfirmPassword, validateEmail, validateNewPassword } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

// staff: the account to edit, or null to create one. branches: all branches.
const StaffFormModal = ({ staff, branches, onClose, onSaved }) => {
  const { user: actor } = useAuth();
  const isEdit = Boolean(staff);

  const [form, setForm] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    password: "",
    confirmPassword: "",
    role: staff?.role || ROLES.STAFF,
    branch: staff?.branch?._id || "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const roleOptions = getAssignableRoles(actor).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
  const branchRequired = form.role !== ROLES.ADMIN;

  // New assignments go to active branches; keep showing the current one even if it's inactive now
  const branchOptions = branches
    .filter((b) => b.status === BRANCH_STATUS.ACTIVE || b._id === staff?.branch?._id)
    .map((b) => ({ value: b._id, label: b.status === BRANCH_STATUS.ACTIVE ? b.name : `${b.name} (inactive)` }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", ...(name === "role" ? { branch: "" } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
      phone: form.phone.trim().length > 20 ? "Phone number is too long" : "",
      branch: branchRequired && !form.branch ? "Select a branch for this role" : "",
      ...(!isEdit && {
        email: validateEmail(form.email),
        password: validateNewPassword(form.password),
        confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      }),
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      role: form.role,
      branch: form.branch || null,
      ...(!isEdit && { email: form.email.trim(), password: form.password }),
    };

    setSubmitting(true);
    try {
      const saved = isEdit ? await staffService.update(staff._id, payload) : await staffService.create(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? "Update Staff" : "Create Staff"} size="lg" footer={false}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <section className="rounded-lg border border-slate-200 p-4 sm:p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Staff Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="Optional"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
            {isEdit ? (
              <div className="sm:col-span-2">
                <p className="mb-1 text-sm font-medium text-slate-700">Email</p>
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{staff.email}</p>
              </div>
            ) : (
              <>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="Used to sign in"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  className="sm:col-span-2"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Role & Branch</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Role" name="role" required options={roleOptions} value={form.role} onChange={handleChange} />
            <Select
              label="Branch"
              name="branch"
              required={branchRequired}
              placeholder={branchRequired ? "Select branch" : "No branch (main admin)"}
              options={branchOptions}
              value={form.branch}
              onChange={handleChange}
              error={errors.branch}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {branchRequired
              ? "This person will only see and work in the selected branch."
              : "An admin without a branch is a main admin and can manage all branches. With a branch, they work only in that branch."}
          </p>
          {isEdit && (
            <p className="mt-2 text-xs text-amber-700">Changing the role or branch logs this person out of all devices.</p>
          )}
        </section>

        <div className="flex justify-center">
          <Button type="submit" loading={submitting} className="min-w-48">
            {isEdit ? "Update Staff" : "Create Staff"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffFormModal;
