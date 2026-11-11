import { useCallback, useState } from "react";
import { LuCalendarDays, LuGift, LuLayoutDashboard, LuPlane, LuWallet } from "react-icons/lu";
import { useSearchParams } from "react-router";
import { usePrintWhenReady } from "../../../hooks/usePrintWhenReady";
import Alert from "../../common/alerts/Alert";
import PayslipPrint from "../PayslipPrint";
import MyAttendanceTab from "./MyAttendanceTab";
import MyHeader from "./MyHeader";
import MyIncentiveTab from "./MyIncentiveTab";
import MyLeaveTab from "./MyLeaveTab";
import MyOverviewTab from "./MyOverviewTab";
import MyPaymentsTab from "./MyPaymentsTab";

const TABS = [
  { key: "overview", label: "Overview", icon: LuLayoutDashboard },
  { key: "attendance", label: "Attendance", icon: LuCalendarDays },
  { key: "leave", label: "Leave", icon: LuPlane },
  { key: "payments", label: "Salary & Payments", short: "Salary", icon: LuWallet },
  { key: "incentive", label: "Incentive", icon: LuGift },
];

// A person's whole HR file: today at a glance, then their history in plain tables. The open tab lives
// in the URL (?tab=payments). staffId: an admin is looking at someone else, so it's read-only;
// without it this is the person's own page, with Check In and leave requests.
const PersonFile = ({ data, staffId, title, branchName }) => {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.key === requested) ? requested : TABS[0].key;
  const [error, setError] = useState("");
  const [printSlip, setPrintSlip] = useState(null);
  usePrintWhenReady(
    printSlip,
    useCallback(() => setPrintSlip(null), []),
  );
  const openTab = (key) => setParams({ tab: key }, { replace: true });

  return (
    <div>
      <div className="space-y-5 print:hidden">
        <MyHeader user={data.user} today={data.today} branchName={branchName} title={title} online={Boolean(data.attendance && !data.attendance.checkOut)} />

        {/* Phones: all five in one grid row, icon over a short label; from sm a row of pills */}
        <div className="grid grid-cols-5 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200/70 sm:flex sm:w-fit sm:max-w-full sm:overflow-x-auto sm:rounded-full sm:[scrollbar-width:none]" role="tablist" aria-label="HR file">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => openTab(item.key)}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10.5px] font-semibold tracking-tight transition sm:shrink-0 sm:flex-row sm:gap-2 sm:rounded-full sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-normal ${tab === item.key ? "bg-brand text-white shadow-md shadow-slate-900/20" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <item.icon className="size-[18px] sm:size-4" aria-hidden="true" />
              <span className="max-w-full truncate sm:hidden">{item.short ?? item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <Alert>{error}</Alert>

        {tab === "overview" && <MyOverviewTab data={data} staffId={staffId} onError={setError} onSeeTab={openTab} />}
        {tab === "attendance" && <MyAttendanceTab staffId={staffId} />}
        {tab === "leave" && <MyLeaveTab staffId={staffId} today={data.today} onError={setError} />}
        {tab === "payments" && <MyPaymentsTab staffId={staffId} onPrint={setPrintSlip} />}
        {tab === "incentive" && <MyIncentiveTab staffId={staffId} />}
      </div>

      {printSlip && <PayslipPrint slip={printSlip} />}
    </div>
  );
};

export default PersonFile;
