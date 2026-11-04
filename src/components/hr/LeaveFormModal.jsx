import { useState } from "react";
import { LEAVE_TYPES } from "../../constants/hr";
import { todayInputValue } from "../../utils/formatDate";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";

const FORM_ID = "leave-form";

// Ask for leave. staff: a manager adding it for someone (then it's approved straight away).
const LeaveFormModal = ({ isOpen, onClose, staff, onSubmit, submitting }) => {
  const today = todayInputValue();
  const [form, setForm] = useState({ user: "", type: "casual", from: today, to: today, reason: "" });
  const [error, setError] = useState("");
  const setField = (name, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [name]: value, ...(name === "from" && value > prev.to ? { to: value } : {}) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (staff && !form.user) return setError("Pick a staff member.");
    try {
      await onSubmit(staff ? form : { type: form.type, from: form.from, to: form.to, reason: form.reason });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? "Add leave" : "Ask for leave"}
      subtitle={staff ? "It's approved straight away" : "Your manager will see the request"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} loading={submitting}>
            {staff ? "Add leave" : "Send request"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        {staff && (
          <Select
            label="Staff member"
            required
            placeholder="Select"
            options={staff.map((person) => ({ value: person._id, label: person.name }))}
            value={form.user}
            onChange={(e) => setField("user", e.target.value)}
          />
        )}
        <Select label="Type" required options={LEAVE_TYPES} value={form.type} onChange={(e) => setField("type", e.target.value)} />
        {form.type === "unpaid" && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Unpaid leave days come off the month's salary.</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="First day" type="date" value={form.from} onChange={(e) => setField("from", e.target.value)} />
          <Input label="Last day" type="date" value={form.to} min={form.from} onChange={(e) => setField("to", e.target.value)} />
        </div>
        <Textarea label="Reason" maxLength={500} value={form.reason} onChange={(e) => setField("reason", e.target.value)} />
      </form>
    </Modal>
  );
};

export default LeaveFormModal;
