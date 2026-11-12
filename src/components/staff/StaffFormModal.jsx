import { useId, useState } from "react";
import { BRANCH_STATUS } from "../../constants/branch";
import { getAssignableRoles, isBranchRole, ROLE_LABELS, ROLES, WEEK_DAYS } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useCreateStaff, useUpdateStaff } from "../../hooks/useStaffApi";
import { fromE164, toE164, validatePhone } from "../../utils/phone";
import { isValid, validateConfirmPassword, validateEmail, validateNewPassword } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import ChipSelect from "../common/forms/ChipSelect";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import PhoneInput from "../common/forms/PhoneInput";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import { roleInfo } from "../../utils/permissions";
import PermissionPicker from "./PermissionPicker";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const toForm = (staff) => ({
  name: staff?.name || "",
  phone: fromE164(staff?.phone),
  email: staff?.email || "",
  password: "",
  confirmPassword: "",
  role: staff?.role || "",
  branch: staff?.branch?._id || "",
  salary: staff?.salary ?? "",
  status: staff && !staff.isActive ? "inactive" : "active",
  staffCode: staff?.staffCode || "",
  joiningDate: staff ? staff.joiningDate?.slice(0, 10) || "" : todayIso(),
  weeklyOffDays: staff?.weeklyOffDays || ["friday"],
  dutyStart: staff ? staff.dutyStart || "" : "09:00",
  dutyEnd: staff ? staff.dutyEnd || "" : "18:00",
  note: staff?.note || "",
  permissions: staff?.permissions || [],
});

const validate = (form, isEdit) => {
  const branchRole = isBranchRole(form.role);
  const passwordGiven = !isEdit || form.password || form.confirmPassword;
  return {
    name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
    role: form.role ? "" : "Select a role",
    phone: validatePhone(form.phone),
    email: form.email.trim() ? validateEmail(form.email) : "",
    password: passwordGiven ? validateNewPassword(form.password) : "",
    confirmPassword: passwordGiven ? validateConfirmPassword(form.password, form.confirmPassword) : "",
    branch: branchRole && !form.branch ? "Select a branch for this role" : "",
    salary: form.salary === "" || Number(form.salary) >= 0 ? "" : "Salary can't be negative",
    staffCode: !form.staffCode || /^\d{4}$/.test(form.staffCode) ? "" : "Staff ID must be exactly 4 digits",
  };
};

const toPayload = (form, isEdit) => {
  const branchRole = isBranchRole(form.role);
  return {
    name: form.name.trim(),
    phone: toE164(form.phone),
    email: form.email.trim(),
    role: form.role,
    branch: branchRole ? form.branch : null,
    salary: form.salary === "" ? null : Number(form.salary),
    isActive: form.status === "active",
    staffCode: form.staffCode,
    joiningDate: form.joiningDate,
    weeklyOffDays: form.weeklyOffDays,
    dutyStart: form.dutyStart,
    dutyEnd: form.dutyEnd,
    note: form.note.trim(),
    permissions: branchRole ? form.permissions : [],
    ...((!isEdit || form.password) && { password: form.password }),
  };
};

// staff: the account to edit, or null to create one. branches: all branches. catalog: permission catalog.
const StaffFormModal = ({ staff, branches, catalog, onClose, onSaved }) => {
  const { user: actor } = useAuth();
  const formId = useId();
  const isEdit = Boolean(staff);

  const [form, setForm] = useState(() => toForm(staff));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const submitting = createStaff.isPending || updateStaff.isPending;

  const branchRole = isBranchRole(form.role);
  const assignable = getAssignableRoles(actor);
  // An admin being edited keeps showing their role even if this actor couldn't give it
  const roleOptions = [...assignable, ...(form.role && !assignable.includes(form.role) ? [form.role] : [])].map((value) => ({
    value,
    label: ROLE_LABELS[value],
  }));
  const role = roleInfo(catalog, form.role);
  const roleLabel = ROLE_LABELS[form.role] || "";
  const roleChanged = isEdit && form.role !== staff.role;

  // A role brings its default permissions; they can still be changed one by one below.
  // Going back to the person's saved role brings back their saved permissions.
  const chooseRole = (value) => {
    setErrors((prev) => ({ ...prev, role: "", branch: "" }));
    setForm((prev) => ({
      ...prev,
      role: value,
      permissions: !isBranchRole(value) ? [] : value === staff?.role ? staff.permissions : (roleInfo(catalog, value)?.permissions ?? []),
    }));
  };

  // New assignments go to active branches; keep showing the current one even if it's inactive now
  const branchOptions = branches
    .filter((b) => b.status === BRANCH_STATUS.ACTIVE || b._id === staff?.branch?._id)
    .map((b) => ({ value: b._id, label: b.status === BRANCH_STATUS.ACTIVE ? b.name : `${b.name} (inactive)` }));

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate(form, isEdit);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    try {
      const payload = toPayload(form, isEdit);
      const saved = isEdit ? await updateStaff.mutateAsync({ id: staff._id, data: payload }) : await createStaff.mutateAsync(payload);
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
      title={isEdit ? "Update Staff" : "Create Staff"}
      subtitle={isEdit ? `${staff.name} · #${staff.staffCode || "—"}` : "Add an admin or a branch staff member"}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Staff" : "Create Staff"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Basic Information" icon="user">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter staff name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <PhoneInput label="Phone" required value={form.phone} onChange={(v) => setField("phone", v)} error={errors.phone} />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="Optional — for password reset"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label={isEdit ? "New password" : "Password"}
              name="password"
              type="password"
              required={!isEdit}
              autoComplete="new-password"
              placeholder={isEdit ? "Leave blank to keep current" : "At least 8 characters"}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              required={!isEdit}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <div>
              <Select
                label="Role"
                name="role"
                required
                placeholder="Select a role"
                options={roleOptions}
                value={form.role}
                onChange={(e) => chooseRole(e.target.value)}
                error={errors.role}
              />
              {role && !errors.role && <p className="mt-1 text-xs text-slate-500">{role.hint}</p>}
            </div>
            {branchRole || !form.role ? (
              <Select
                label="Branch"
                name="branch"
                required
                placeholder="Select branch"
                options={branchOptions}
                value={form.branch}
                onChange={handleChange}
                error={errors.branch}
              />
            ) : (
              <div>
                <p className="mb-1 text-sm font-medium text-slate-700">Branch</p>
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">All branches (main admin)</p>
              </div>
            )}
            <Input
              label="Staff Salary (৳)"
              name="salary"
              inputMode="numeric"
              placeholder="e.g. 25000"
              value={form.salary}
              onChange={(e) => setField("salary", e.target.value.replace(/[^\d.]/g, ""))}
              error={errors.salary}
            />
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
          </div>
          {isEdit && (
            <p className="mt-3 text-xs text-amber-700">Changing the role, branch or password, or deactivating, logs this person out of all devices.</p>
          )}
        </FormSection>

        <FormSection title="HRM & Attendance" description="Staff ID and duty timing" icon="calendar" muted>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Staff ID / Machine PIN"
                name="staffCode"
                inputMode="numeric"
                maxLength={4}
                placeholder="Leave blank to auto-generate (e.g. 1024)"
                value={form.staffCode}
                onChange={(e) => setField("staffCode", e.target.value.replace(/\D/g, "").slice(0, 4))}
                error={errors.staffCode}
                inputClassName="font-mono"
              />
              {!errors.staffCode && <p className="mt-1 text-xs text-slate-500">A unique 4-digit code.</p>}
            </div>
            <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
            <ChipSelect label="Weekly Off Days" options={WEEK_DAYS} value={form.weeklyOffDays} onChange={(v) => setField("weeklyOffDays", v)} />
            <Input label="Duty Start Time" name="dutyStart" type="time" value={form.dutyStart} onChange={handleChange} error={errors.dutyStart} />
            <Input label="Duty End Time" name="dutyEnd" type="time" value={form.dutyEnd} onChange={handleChange} error={errors.dutyEnd} />
            <Textarea
              label="Staff Note"
              name="note"
              maxLength={500}
              placeholder="Optional remarks or notes"
              value={form.note}
              onChange={handleChange}
              error={errors.note}
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection
          title="Access & Permissions"
          description={branchRole ? `What this ${roleLabel} can see and do in their branch` : undefined}
          icon="shield"
        >
          {!form.role ? (
            <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">Choose a role first. Its usual permissions are ticked for you.</p>
          ) : !branchRole ? (
            <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {roleLabel} has full access to every module in every branch, so there are no permissions to choose.
            </p>
          ) : catalog ? (
            <div className="space-y-4">
              {roleChanged && (
                <p className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
                  Role changed to {roleLabel}: the permissions below are now that role's defaults.
                </p>
              )}
              {form.role === ROLES.BRANCH_MANAGER && (
                <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">A branch can have only one Branch Manager.</p>
              )}
              <PermissionPicker
                catalog={catalog}
                value={form.permissions}
                onChange={(v) => setField("permissions", v)}
                defaults={role?.permissions ?? null}
                roleLabel={roleLabel}
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading permissions...</p>
          )}
        </FormSection>
      </form>
    </Modal>
  );
};

export default StaffFormModal;
