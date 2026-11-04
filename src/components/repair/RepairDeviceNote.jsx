import { LuHistory, LuShieldCheck, LuStore } from "react-icons/lu";
import { Link } from "react-router";
import { REPAIR_STATUS } from "../../constants/repair";
import { repairDetailPath } from "../../constants/routes";
import { formatDate } from "../../utils/formatDate";
import Badge from "../common/data/Badge";

// Still under a past repair's warranty?
const underWarranty = (job) => job.warrantyUntil && new Date(job.warrantyUntil) >= new Date();

// A device's earlier repairs here, newest first
export const EarlierRepairs = ({ jobs }) => (
  <ul className="divide-y divide-slate-100">
    {jobs.map((job) => (
      <li key={job._id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm">
        <span className="min-w-0">
          <Link to={repairDetailPath(job._id)} className="font-mono text-xs font-semibold text-slate-900 hover:underline">
            {job.repairNo}
          </Link>
          <span className="text-slate-500"> · {formatDate(job.receivedAt)}</span>
          <span className="block truncate text-slate-600">{job.problem}</span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {underWarranty(job) && (
            <Badge tone="green">
              <LuShieldCheck className="mr-1 size-3" aria-hidden="true" />
              Warranty till {formatDate(job.warrantyUntil)}
            </Badge>
          )}
          <Badge tone={REPAIR_STATUS[job.status].tone}>{REPAIR_STATUS[job.status].label}</Badge>
        </span>
      </li>
    ))}
  </ul>
);

// What this branch already knows about an IMEI typed at the counter: its sale, and earlier repairs
const RepairDeviceNote = ({ history, onUseSale }) => {
  if (!history || (!history.sale && history.earlier.length === 0)) return null;
  const { sale, earlier } = history;

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-3.5">
      {sale && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex min-w-0 items-start gap-2 text-sm text-slate-700">
            <LuStore className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>
              Sold here on {formatDate(sale.date)}, {sale.invoiceNo}
              {sale.deviceName ? ` · ${sale.deviceName}` : ""}
              {sale.customer ? ` · ${sale.customer.name}` : " · walk-in"}
            </span>
          </p>
          <button
            type="button"
            onClick={() => onUseSale(sale)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
          >
            Use these details
          </button>
        </div>
      )}
      {earlier.length > 0 && (
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <LuHistory className="size-4 text-slate-500" aria-hidden="true" />
            Repaired here {earlier.length} {earlier.length === 1 ? "time" : "times"} before
          </p>
          <EarlierRepairs jobs={earlier} />
        </div>
      )}
    </div>
  );
};

export default RepairDeviceNote;
