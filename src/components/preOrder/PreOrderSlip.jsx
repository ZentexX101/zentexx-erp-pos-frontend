import darkLogo from "../../assets/decent-logo-dark.png";
import { BUSINESS_NAME } from "../../constants/app";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { formatPhone } from "../../utils/phone";

const Row = ({ label, children, strong }) => (
  <tr className={strong ? "font-bold" : ""}>
    <td className="py-0.5 pr-3 align-top text-slate-600 [overflow-wrap:anywhere]">{label}</td>
    <td className="whitespace-nowrap py-0.5 text-right align-top tabular-nums">{children}</td>
  </tr>
);

const Fact = ({ label, children }) => (
  <div className="break-inside-avoid">
    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="font-medium [overflow-wrap:anywhere]">{children}</p>
  </div>
);

// The customer's booking slip on A5: what was booked and the advance they paid
const PreOrderSlip = ({ row }) => (
  <div className="hidden text-[11px] leading-snug text-slate-900 print:block">
    <style>{"@media print { @page { size: A5; margin: 10mm; } html, body { background: #fff; } }"}</style>
    <header className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-2">
      <div>
        <img src={darkLogo} alt={BUSINESS_NAME} className="h-7 w-auto" />
        <p className="mt-1 font-semibold">{row.branch?.name}</p>
        {row.branch?.address && <p>{row.branch.address}</p>}
        {row.branch?.phone && <p>{formatPhone(row.branch.phone)}</p>}
      </div>
      <div className="shrink-0 text-right">
        <h1 className="text-base font-bold">Pre Order Slip</h1>
        <p className="font-mono font-semibold">{row.preOrderNo}</p>
        <p>{formatDateTime(row.bookedAt)}</p>
      </div>
    </header>

    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
      <Fact label="Customer">{row.customerName}</Fact>
      <Fact label="Phone">{formatPhone(row.customerPhone)}</Fact>
      {row.bookedBy?.name && <Fact label="Booked by">{row.bookedBy.name}</Fact>}
      {row.expectedDate && <Fact label="Expected by">{formatDate(row.expectedDate)}</Fact>}
    </div>

    <table className="mt-3 w-full border-t border-slate-800">
      <tbody>
        {row.items.map((item) => (
          <Row key={item.product} label={`${item.quantity} × ${item.name}`}>
            {formatTaka(item.total)}
          </Row>
        ))}
        {row.discount > 0 && <Row label="Discount">− {formatTaka(row.discount)}</Row>}
        {row.deliveryCharge > 0 && <Row label="Delivery charge">{formatTaka(row.deliveryCharge)}</Row>}
        <Row label="Total">{formatTaka(row.total)}</Row>
        <Row label="Advance paid" strong>
          {formatTaka(row.paidAmount)}
        </Row>
        <Row label="Left to pay">{formatTaka(Math.max(roundTaka(row.total - row.paidAmount), 0))}</Row>
      </tbody>
    </table>

    <p className="mt-3">Please bring this slip when you collect the product.</p>

    <div className="mt-10 flex justify-between gap-6">
      <p className="w-36 border-t border-slate-500 pt-1 text-center">Customer</p>
      <p className="w-36 border-t border-slate-500 pt-1 text-center">Authorised by</p>
    </div>
  </div>
);

export default PreOrderSlip;
