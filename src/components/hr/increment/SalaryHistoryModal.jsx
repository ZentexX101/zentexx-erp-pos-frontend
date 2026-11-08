import { LuArrowRight, LuFlag, LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { useSalaryHistoryData } from "../../../hooks/useHrApi";
import { formatDate } from "../../../utils/formatDate";
import { monthLabel } from "../../../utils/hr";
import { changeText, changeTone } from "../../../utils/increment";
import { formatTaka } from "../../../utils/money";
import Alert from "../../common/alerts/Alert";
import Button from "../../common/buttons/Button";
import Modal from "../../common/modals/Modal";

// One step on the timeline: a dot, the month it starts and what changed
const Step = ({ icon, tone, title, children, last }) => {
  const Icon = icon;
  return (
    <li className="relative flex gap-4 pb-6">
      {!last && <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" aria-hidden="true" />}
      <span className={`relative flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${tone}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {children}
      </div>
    </li>
  );
};

// One person's salary story by date: where they started, every change (with who made it and why), and now
const SalaryHistoryModal = ({ userId, onClose, onChange }) => {
  const { data, isLoading, error } = useSalaryHistoryData(userId);

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={data ? `${data.user.name}'s salary history` : "Salary history"}
      subtitle={data ? [data.user.designation, data.user.staffCode && `ID ${data.user.staffCode}`].filter(Boolean).join(" · ") : ""}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {onChange && <Button onClick={onChange}>Change salary</Button>}
        </>
      }
    >
      <Alert>{error?.message}</Alert>
      {isLoading && !data ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
      ) : (
        data && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Started at</p>
                <p className="font-bold tabular-nums text-slate-900">{formatTaka(data.startingSalary)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Salary now</p>
                <p className="font-bold tabular-nums text-slate-900">{formatTaka(data.current)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Grown by</p>
                <p className={`font-bold tabular-nums ${changeTone(data.totalRaise)}`}>{changeText(data.totalRaise, data.totalPercent)}</p>
              </div>
            </div>

            <ol>
              <Step icon={LuFlag} tone="bg-slate-100 text-slate-500" title={`Joined at ${formatTaka(data.startingSalary)}`} last={data.changes.length === 0}>
                <p className="text-xs text-slate-500">{data.user.joiningDate ? formatDate(data.user.joiningDate) : "Joining date not set"}</p>
              </Step>
              {data.changes.map((change, index) => {
                const up = change.difference >= 0;
                return (
                  <Step
                    key={change._id}
                    icon={up ? LuTrendingUp : LuTrendingDown}
                    tone={up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}
                    title={`From ${monthLabel(change.effectiveMonth)}`}
                    last={index === data.changes.length - 1}
                  >
                    <div className="mt-1.5 rounded-xl px-3.5 py-3 ring-1 ring-slate-200">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums text-slate-900">
                        {formatTaka(change.oldSalary)}
                        <LuArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
                        {formatTaka(change.newSalary)}
                        <span className={`text-xs ${changeTone(change.difference)}`}>{changeText(change.difference, change.percent)}</span>
                        {change.upcoming && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Upcoming</span>}
                      </p>
                      {change.reason && <p className="mt-1 text-sm text-slate-600 [overflow-wrap:anywhere]">{change.reason}</p>}
                      <p className="mt-1 text-xs text-slate-500">
                        Set on {formatDate(change.createdAt)}
                        {change.createdBy?.name ? ` by ${change.createdBy.name}` : ""}
                      </p>
                    </div>
                  </Step>
                );
              })}
            </ol>
            {data.changes.length === 0 && <p className="text-center text-sm text-slate-500">No salary change yet.</p>}
          </div>
        )
      )}
    </Modal>
  );
};

export default SalaryHistoryModal;
