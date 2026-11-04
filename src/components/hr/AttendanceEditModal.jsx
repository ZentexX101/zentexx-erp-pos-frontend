import { useState } from "react";
import { dayLabel, timeInput } from "../../utils/hr";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Modal from "../common/modals/Modal";

// A manager fixes a day: a forgotten check-out, or someone who came without tapping
const AttendanceEditModal = ({ row, day, onClose, onSave, saving }) => {
  const [inTime, setInTime] = useState(timeInput(row.checkIn));
  const [outTime, setOutTime] = useState(timeInput(row.checkOut));
  const [note, setNote] = useState(row.note ?? "");
  const [error, setError] = useState("");

  const save = async (values) => {
    try {
      await onSave({ user: row.user._id, day, ...values });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={row.user.name}
      subtitle={dayLabel(day)}
      footer={
        <>
          {row.checkIn && (
            <Button variant="dangerOutline" onClick={() => save({ checkIn: "", checkOut: "", note: "" })} className="mr-auto">
              Clear day
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save({ checkIn: inTime, checkOut: outTime, note })} loading={saving} disabled={!inTime}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Check in" type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} />
          <Input label="Check out" type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} />
        </div>
        <Input label="Note" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
};

export default AttendanceEditModal;
