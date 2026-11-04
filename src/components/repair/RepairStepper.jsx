import { LuCheck, LuX } from "react-icons/lu";
import { REPAIR_STATUS, REPAIR_STEPS } from "../../constants/repair";

// Where the job stands. A cancelled job shows how far it got, ending in a cross.
const RepairStepper = ({ job }) => {
  const cancelled = job.status === "cancelled";
  const reached = cancelled
    ? job.history.filter((row) => row.status !== "cancelled").reduce((far, row) => Math.max(far, REPAIR_STEPS.indexOf(row.status)), 0)
    : REPAIR_STEPS.indexOf(job.status);
  const steps = cancelled ? [...REPAIR_STEPS.slice(0, reached + 1), "cancelled"] : REPAIR_STEPS;

  return (
    <ol className="flex items-start" aria-label="Job progress">
      {steps.map((step, index) => {
        const isCross = step === "cancelled";
        const done = cancelled || index <= reached;
        const current = !cancelled && index === reached && job.status !== "delivered";
        return (
          <li key={step} className="flex min-w-0 flex-1 flex-col items-center text-center last:flex-none last:basis-auto">
            <div className="flex w-full items-center">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCross
                    ? "bg-red-500 text-white"
                    : current
                      ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCross ? <LuX className="size-4" aria-hidden="true" /> : done && !current ? <LuCheck className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={`mx-1.5 h-1 min-w-3 flex-1 rounded-full ${index < reached || (cancelled && index === reached) ? "bg-emerald-500" : "bg-slate-200"}`}
                />
              )}
            </div>
            <span className={`mt-1.5 w-full pr-3 text-left text-xs font-medium ${current || isCross ? "text-slate-900" : "text-slate-500"}`}>
              {REPAIR_STATUS[step].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default RepairStepper;
