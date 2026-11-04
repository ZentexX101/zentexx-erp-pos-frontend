import { useState } from "react";
import { useMonthSheetData } from "../../hooks/useHrApi";
import { currentMonth } from "../../utils/hr";
import Modal from "../common/modals/Modal";
import AttendanceCalendar from "./AttendanceCalendar";
import MonthSwitcher from "./MonthSwitcher";

// One person's month as a calendar, opened from their name
const AttendanceMonthModal = ({ person, onClose }) => {
  const [month, setMonth] = useState(currentMonth());
  const { data } = useMonthSheetData({ month, user: person._id });
  const c = data?.counts;

  return (
    <Modal isOpen onClose={onClose} title={person.name} subtitle="Attendance by month" size="lg">
      <div className="space-y-4">
        <MonthSwitcher month={month} onChange={setMonth} />
        {data && <AttendanceCalendar days={data.days} />}
        {c && (
          <p className="text-sm text-slate-600">
            {c.present} present · {c.late} late · {c.leave} paid leave · {c.unpaidLeave} unpaid leave · {c.absent} absent · {c.off} off
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AttendanceMonthModal;
