import darkLogo from "../../assets/decent-logo-dark.png";
import { BUSINESS_NAME } from "../../constants/app";
import { REPAIR_STATUS } from "../../constants/repair";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";

const Row = ({ label, children, strong }) => (
  <tr className={strong ? "font-bold" : ""}>
    <td className="py-0.5 pr-3 align-top text-slate-600">{label}</td>
    <td className="py-0.5 text-right align-top tabular-nums">{children}</td>
  </tr>
);

const Fact = ({ label, children }) => (
  <div className="break-inside-avoid">
    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="font-medium">{children}</p>
  </div>
);

// The customer's slip on A5: what was left with us, and what it came to. Never shows the shop's costs.
const RepairSlip = ({ job }) => {
  const closed = Boolean(job.closedAt);
  return (
    <div className="hidden text-[11px] leading-snug text-slate-900 print:block">
      <style>{"@media print { @page { size: A5; margin: 10mm; } html, body { background: #fff; } }"}</style>
      <header className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-2">
        <div>
          <img src={darkLogo} alt={BUSINESS_NAME} className="h-7 w-auto" />
          <p className="mt-1 font-semibold">{job.branch?.name}</p>
          {job.branch?.address && <p>{job.branch.address}</p>}
          {job.branch?.phone && <p>{formatPhone(job.branch.phone)}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-base font-bold">{closed ? "Repair Bill" : "Repair Slip"}</h1>
          <p className="font-mono font-semibold">{job.repairNo}</p>
          <p>{formatDateTime(job.receivedAt)}</p>
          <p className="font-medium">{REPAIR_STATUS[job.status].label}</p>
        </div>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <Fact label="Customer">{job.customerName}</Fact>
        <Fact label="Phone">{formatPhone(job.customerPhone)}</Fact>
        <Fact label="Device">
          {job.deviceName}
          {job.color ? ` (${job.color})` : ""}
        </Fact>
        {job.imei && <Fact label="IMEI">{job.imei}</Fact>}
        {job.accessories.length > 0 && <Fact label="Came with">{job.accessories.join(", ")}</Fact>}
        {job.promisedDate && !closed && <Fact label="Promised by">{formatDate(job.promisedDate)}</Fact>}
      </div>
      <div className="mt-2 space-y-2">
        <Fact label="Problem">{job.problem}</Fact>
        {job.condition && <Fact label="Condition when received">{job.condition}</Fact>}
      </div>

      <table className="mt-3 w-full border-t border-slate-800">
        <tbody>
          {closed ? (
            <>
              <Row label={job.status === "cancelled" ? "Fee" : "Charge"}>{formatTaka(job.charge)}</Row>
              <Row label="Paid">{formatTaka(job.paidAmount)}</Row>
              {job.refundAmount > 0 && <Row label="Refunded">{formatTaka(job.refundAmount)}</Row>}
              {job.dueAmount > 0 && (
                <Row label="Due" strong>
                  {formatTaka(job.dueAmount)}
                </Row>
              )}
              {job.warrantyUntil && (
                <Row label="Repair warranty">
                  {job.warrantyDays} days, till {formatDate(job.warrantyUntil)}
                </Row>
              )}
            </>
          ) : (
            <>
              {job.estimate > 0 && <Row label="Estimate">{formatTaka(job.estimate)}</Row>}
              <Row label="Advance paid" strong>
                {formatTaka(job.paidAmount)}
              </Row>
            </>
          )}
        </tbody>
      </table>

      {!closed && <p className="mt-3">Please bring this slip when you collect the device.</p>}

      <div className="mt-10 flex justify-between gap-6">
        <p className="w-36 border-t border-slate-500 pt-1 text-center">Customer</p>
        <p className="w-36 border-t border-slate-500 pt-1 text-center">Authorised by</p>
      </div>
    </div>
  );
};

export default RepairSlip;
