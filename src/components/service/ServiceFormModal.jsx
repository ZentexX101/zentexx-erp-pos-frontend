import { useId, useState } from "react";
import { SERVICE_STATUS } from "../../constants/service";
import { useCreateService, useUpdateService } from "../../hooks/useServiceApi";
import { formatTaka } from "../../utils/money";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: SERVICE_STATUS.ACTIVE, label: "Active" },
  { value: SERVICE_STATUS.INACTIVE, label: "Inactive" },
];

// Product price used for the example under the percentages
const EXAMPLE_PRICE = 10000;

const toForm = (service) => ({
  name: service?.name || "",
  pricePercent: service ? String(service.pricePercent) : "",
  incentivePercent: service ? String(service.incentivePercent) : "",
  status: service?.status || SERVICE_STATUS.ACTIVE,
});

const validatePercent = (value, label) => {
  if (value === "") return `${label} is required`;
  const number = Number(value);
  if (Number.isNaN(number)) return `${label} must be a number`;
  return number <= 100 ? "" : `${label} can't be more than 100%`;
};

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  pricePercent: validatePercent(form.pricePercent, "Service price"),
  incentivePercent: validatePercent(form.incentivePercent, "Staff incentive"),
});

// Digits and one decimal point only
const toDecimal = (value) => value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

// service: the service to edit, or null to create one
const ServiceFormModal = ({ service, onClose, onSaved }) => {
  const isEdit = Boolean(service);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(service));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createService = useCreateService();
  const updateService = useUpdateService();
  const submitting = createService.isPending || updateService.isPending;

  // Live example on a ৳10,000 product; both percentages are of the product's price
  const servicePrice = (EXAMPLE_PRICE * (Number(form.pricePercent) || 0)) / 100;
  const incentive = (EXAMPLE_PRICE * (Number(form.incentivePercent) || 0)) / 100;

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
      pricePercent: Number(form.pricePercent),
      incentivePercent: Number(form.incentivePercent),
      status: form.status,
    };

    try {
      const saved = isEdit
        ? await updateService.mutateAsync({ id: service._id, data: payload })
        : await createService.mutateAsync(payload);
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
      title={isEdit ? "Update Service" : "Create Service"}
      subtitle={isEdit ? service.name : "An add-on sold with a product, like coverage or warranty"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Service" : "Create Service"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Service Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="name"
              required
              autoFocus
              placeholder="Enter service name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              className="sm:col-span-2"
            />
            <Input
              label="Service Price (%)"
              name="pricePercent"
              required
              inputMode="decimal"
              placeholder="e.g. 5 for 5%"
              value={form.pricePercent}
              onChange={(e) => setField("pricePercent", toDecimal(e.target.value))}
              error={errors.pricePercent}
            />
            <Input
              label="Staff Incentive (%)"
              name="incentivePercent"
              required
              inputMode="decimal"
              placeholder="e.g. 2 for 2%"
              value={form.incentivePercent}
              onChange={(e) => setField("incentivePercent", toDecimal(e.target.value))}
              error={errors.incentivePercent}
            />
            <p className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 sm:col-span-2">
              Example: on a {formatTaka(EXAMPLE_PRICE)} product, the service costs{" "}
              <span className="font-semibold">{formatTaka(servicePrice)}</span> and the staff gets{" "}
              <span className="font-semibold">{formatTaka(incentive)}</span> incentive.
            </p>
            <Select label="Status" name="status" options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
          </div>
        </FormSection>
      </form>
    </Modal>
  );
};

export default ServiceFormModal;
