import { useCallback, useState } from "react";
import { LuLogIn, LuLogOut, LuPrinter, LuTrash2 } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Badge from "../../components/common/data/Badge";
import PageHeader from "../../components/common/layout/PageHeader";
import AttendanceCalendar from "../../components/hr/AttendanceCalendar";
import HrStat from "../../components/hr/HrStat";
import LeaveFormModal from "../../components/hr/LeaveFormModal";
import MonthSwitcher from "../../components/hr/MonthSwitcher";
import PayslipPrint from "../../components/hr/PayslipPrint";
import { LEAVE_STATUS_TONE, leaveTypeLabel } from "../../constants/hr";
import { useCancelLeave, useCheckIn, useCheckOut, useMonthSheetData, useMyHrData, useRequestLeave } from "../../hooks/useHrApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { currentMonth, dayLabel, dutyLabel, minutesLabel, monthLabel, shortDayLabel, timeLabel, workedLabel } from "../../utils/hr";
import { formatTaka } from "../../utils/money";

// A staff member's own page: one big Check In / Check Out button, their month, leaves and salary slips
const MyHr = () => {
  // all states
  const [month, setMonth] = useState(currentMonth());
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [printSlip, setPrintSlip] = useState(null);

  // call hr api
  const { data, isLoading } = useMyHrData();
  const { data: sheet } = useMonthSheetData({ month });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const requestLeave = useRequestLeave();
  const cancelLeave = useCancelLeave();
  usePrintWhenReady(
    printSlip,
    useCallback(() => setPrintSlip(null), []),
  );

  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading || !data) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />;

  const { attendance: row, user, today, month: pay } = data;
  const counts = sheet?.counts;

  return (
    <div>
      <div className="space-y-5 print:hidden">
        <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} subtitle={dayLabel(today)} />
        <Alert>{error}</Alert>

        {/* Today */}
        <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {!row ? "You haven't checked in yet" : row.checkOut ? "All done for today" : "You're checked in"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {row ? (
                <>
                  In at <span className="font-semibold text-slate-800">{timeLabel(row.checkIn)}</span>
                  {row.lateMinutes > 0 && <span className="text-amber-700"> ({minutesLabel(row.lateMinutes)} late)</span>}
                  {row.checkOut && (
                    <>
                      {" "}
                      · Out at <span className="font-semibold text-slate-800">{timeLabel(row.checkOut)}</span> · Worked {workedLabel(row.checkIn, row.checkOut)}
                    </>
                  )}
                </>
              ) : user.dutyStart ? (
                `Your duty starts at ${dutyLabel(user.dutyStart)}${user.dutyEnd ? ` and ends at ${dutyLabel(user.dutyEnd)}` : ""}`
              ) : (
                "Tap when you arrive"
              )}
            </p>
          </div>
          {!row && (
            <Button
              onClick={() => run(() => checkIn.mutateAsync())}
              loading={checkIn.isPending}
              className="h-14 w-full shrink-0 rounded-xl px-8 text-base sm:w-auto"
            >
              <LuLogIn className="size-5" aria-hidden="true" />
              Check In
            </Button>
          )}
          {row && !row.checkOut && (
            <Button
              onClick={() => run(() => checkOut.mutateAsync())}
              loading={checkOut.isPending}
              variant="secondary"
              className="h-14 w-full shrink-0 rounded-xl px-8 text-base sm:w-auto"
            >
              <LuLogOut className="size-5" aria-hidden="true" />
              Check Out
            </Button>
          )}
        </section>

        {/* This month's money */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <HrStat label="Salary" value={formatTaka(pay.basic)} hint={monthLabel(pay.month)} />
          <HrStat label="Incentive so far" value={formatTaka(pay.incentive)} tone="text-emerald-600" hint="From what you sold" />
          <HrStat
            label="Cut so far"
            value={formatTaka(pay.absentDeduction)}
            tone={pay.absentDeduction ? "text-red-600" : "text-slate-900"}
            hint={`${pay.counts.deductible} days`}
          />
          <HrStat label="Advance to return" value={formatTaka(pay.advanceOwed)} tone={pay.advanceOwed ? "text-amber-700" : "text-slate-900"} />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[3fr_2fr]">
          {/* Attendance month */}
          <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">My attendance</h2>
              <MonthSwitcher month={month} onChange={setMonth} />
            </div>
            {sheet && <AttendanceCalendar days={sheet.days} />}
            {counts && (
              <p className="mt-3 text-sm text-slate-600">
                {counts.present} present · {counts.late} late · {counts.leave} leave · {counts.absent} absent
              </p>
            )}
          </section>

          <div className="min-w-0 space-y-4">
            {/* Leaves */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900">My leaves</h2>
                <Button variant="secondary" onClick={() => setAsking(true)}>
                  Ask for leave
                </Button>
              </div>
              {data.leaves.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No leave yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {data.leaves.map((leave) => (
                    <li key={leave._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-800">{leaveTypeLabel(leave.type)}</span>
                        <span className="block text-xs text-slate-500">
                          {shortDayLabel(leave.from)}
                          {leave.to !== leave.from && ` – ${shortDayLabel(leave.to)}`} · {leave.days} day{leave.days === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge tone={LEAVE_STATUS_TONE[leave.status]}>{leave.status}</Badge>
                        {(leave.status === "pending" || leave.from > today) && leave.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => run(() => cancelLeave.mutateAsync(leave._id))}
                            aria-label="Take back"
                            title="Take back"
                            className="rounded p-1 text-slate-400 hover:text-red-600"
                          >
                            <LuTrash2 className="size-4" aria-hidden="true" />
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Salary slips */}
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <h2 className="font-semibold text-slate-900">My salary slips</h2>
              {data.slips.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No salary paid yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {data.slips.map((slip) => (
                    <li key={slip._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate font-medium text-slate-800">{monthLabel(slip.month)}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-semibold tabular-nums text-slate-900">{formatTaka(slip.netPaid)}</span>
                        <button
                          type="button"
                          onClick={() => setPrintSlip(slip)}
                          aria-label="Print slip"
                          title="Print slip"
                          className="rounded p-1 text-slate-400 hover:text-slate-900"
                        >
                          <LuPrinter className="size-4" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {asking && (
          <LeaveFormModal isOpen onClose={() => setAsking(false)} onSubmit={(form) => requestLeave.mutateAsync(form)} submitting={requestLeave.isPending} />
        )}
      </div>

      {printSlip && <PayslipPrint slip={printSlip} />}
    </div>
  );
};

export default MyHr;
