import { useState } from "react";
import { BRANCH_STATUS, ZKTECO_DEFAULT_PORT } from "../../constants/branch";
import { branchService } from "../../services/branchService";
import { isValid, validateEmail } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Toggle from "../common/forms/Toggle";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: BRANCH_STATUS.ACTIVE, label: "Active" },
  { value: BRANCH_STATUS.INACTIVE, label: "Inactive" },
];

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const toForm = (branch) => ({
  name: branch?.name || "",
  address: branch?.address || "",
  phone: branch?.phone || "",
  email: branch?.email || "",
  status: branch?.status || BRANCH_STATUS.ACTIVE,
  zktecoEnabled: branch?.zkteco?.enabled || false,
  zktecoIp: branch?.zkteco?.ip || "",
  zktecoPort: String(branch?.zkteco?.port || ZKTECO_DEFAULT_PORT),
  zktecoSerial: branch?.zkteco?.serialNumber || "",
});

const validate = (form) => {
  const port = Number(form.zktecoPort);
  return {
    name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
    address: form.address.trim() ? "" : "Address is required",
    phone: /^\+?[0-9\s-]{6,20}$/.test(form.phone.trim()) ? "" : "Enter a valid phone number",
    email: form.email.trim() ? validateEmail(form.email) : "",
    zktecoIp: !form.zktecoEnabled
      ? ""
      : !form.zktecoIp.trim()
        ? "IP address is required when the machine is enabled"
        : IPV4.test(form.zktecoIp.trim())
          ? ""
          : "Enter a valid IP address, e.g. 192.168.1.201",
    zktecoPort: !form.zktecoEnabled || (Number.isInteger(port) && port >= 1 && port <= 65535) ? "" : "Port must be 1–65535",
  };
};

// Backend field names → form field names, for showing server validation errors on the right input
const SERVER_FIELD = { "zkteco.ip": "zktecoIp", "zkteco.port": "zktecoPort", "zkteco.serialNumber": "zktecoSerial" };

// branch: the branch to edit, or null to create one
const BranchFormModal = ({ branch, onClose, onSaved }) => {
  const isEdit = Boolean(branch);
  const [form, setForm] = useState(() => toForm(branch));
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
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: form.status,
      zkteco: {
        enabled: form.zktecoEnabled,
        ip: form.zktecoIp.trim(),
        port: Number(form.zktecoPort) || ZKTECO_DEFAULT_PORT,
        serialNumber: form.zktecoSerial.trim(),
      },
    };

    setSubmitting(true);
    try {
      const saved = isEdit ? await branchService.update(branch._id, payload) : await branchService.create(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) {
        setErrors(
          Object.fromEntries(Object.entries(err.details).map(([field, message]) => [SERVER_FIELD[field] || field, message]))
        );
      }
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? "Update Branch" : "Create Branch"} size="xl" footer={false}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <section className="rounded-lg border border-slate-200 p-4 sm:p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Branch Information</h3>
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
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">ZKTeco Biometric Machine</h3>
              <p className="text-sm text-slate-500">Configure the attendance machine for this branch (optional)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{form.zktecoEnabled ? "Enabled" : "Disabled"}</span>
              <Toggle
                checked={form.zktecoEnabled}
                onChange={(value) => setField("zktecoEnabled", value)}
                label="Enable ZKTeco machine"
              />
            </div>
          </div>

          {form.zktecoEnabled && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input
                label="IP address"
                name="zktecoIp"
                required
                placeholder="192.168.1.201"
                value={form.zktecoIp}
                onChange={handleChange}
                error={errors.zktecoIp}
              />
              <Input
                label="Port"
                name="zktecoPort"
                inputMode="numeric"
                value={form.zktecoPort}
                onChange={(e) => setField("zktecoPort", e.target.value.replace(/\D/g, ""))}
                error={errors.zktecoPort}
              />
              <Input
                label="Serial number"
                name="zktecoSerial"
                placeholder="Optional"
                value={form.zktecoSerial}
                onChange={handleChange}
                error={errors.zktecoSerial}
              />
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <Button type="submit" loading={submitting} className="min-w-48">
            {isEdit ? "Update Branch" : "Create Branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchFormModal;
