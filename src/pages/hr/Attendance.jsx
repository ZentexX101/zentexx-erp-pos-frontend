import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import AttendanceDayView from "../../components/hr/AttendanceDayView";
import AttendanceEditModal from "../../components/hr/AttendanceEditModal";
import AttendanceRegister from "../../components/hr/AttendanceRegister";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import { useAuth } from "../../hooks/useAuth";
import { useAttendanceRegisterData, useDayBoardData, useMarkAttendance } from "../../hooks/useHrApi";
import { hasPermission } from "../../utils/access";
import { todayInputValue } from "../../utils/formatDate";
import { currentMonth } from "../../utils/hr";

const VIEWS = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
];

// Attendance two ways: one day in detail, or a whole month for everyone at a glance
const Attendance = () => {
  const { user } = useAuth();

  // all states
  const [view, setView] = useState("day");
  const [day, setDay] = useState(todayInputValue());
  const [month, setMonth] = useState(currentMonth());
  const [editing, setEditing] = useState(null);

  // call hr api (only the open view loads)
  const board = useDayBoardData(day, { enabled: view === "day" });
  const register = useAttendanceRegisterData(month, { enabled: view === "month" });
  const mark = useMarkAttendance();
  const error = view === "day" ? board.error : register.error;

  // A day clicked in the month view opens in the day view
  const openDay = (next) => {
    setDay(next);
    setView("day");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        subtitle="Who came, when, and who is away"
        actions={
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="View">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={view === option.value}
                onClick={() => setView(option.value)}
                className={`rounded-lg px-5 py-1.5 text-sm font-medium transition ${view === option.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <Alert>{error?.message}</Alert>

      {view === "day" ? (
        <AttendanceDayView
          day={day}
          onDay={setDay}
          data={board.data}
          isLoading={board.isLoading}
          canManage={hasPermission(user, "hr.manage")}
          onEdit={setEditing}
        />
      ) : (
        <>
          <MonthSwitcher month={month} onChange={setMonth} />
          <AttendanceRegister data={register.data} isLoading={register.isLoading} onOpenDay={openDay} />
        </>
      )}

      {editing && (
        <AttendanceEditModal row={editing} day={day} onClose={() => setEditing(null)} onSave={(values) => mark.mutateAsync(values)} saving={mark.isPending} />
      )}
    </div>
  );
};

export default Attendance;
