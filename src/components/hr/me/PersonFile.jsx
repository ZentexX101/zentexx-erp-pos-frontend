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
  { key: "payments", label: "Salary & Payments", icon: LuWallet },
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
        <MyHeader user={data.user} today={data.today} branchName={branchName} title={title} />

        <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] sm:w-fit" role="tablist" aria-label="HR file">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => openTab(item.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === item.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
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
