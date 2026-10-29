import { BUSINESS_NAME } from "../../constants/app";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";

const cell = "border-b border-slate-200 px-2 py-1";

const TotalRow = ({ label, value, strong }) => (
  <div className={`flex justify-between ${strong ? "border-t border-slate-800 pt-1 text-sm font-bold" : ""}`}>
    <span>{label}</span>
    <span>{formatTaka(value)}</span>
  </div>
);

// Printable invoice of one sale (only visible when printing)
const SaleInvoicePrint = ({ sale }) => (
  <div className="hidden text-[11px] text-slate-800 print:block">
    <header className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
      <div>
        <h1 className="text-xl font-bold">{BUSINESS_NAME}</h1>
        {sale.branch && (
          <p className="text-slate-600">
            {sale.branch.name} · {sale.branch.address} · {formatPhone(sale.branch.phone)}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-base font-bold">INVOICE</p>
        <p className="font-mono">{sale.invoiceNo}</p>
        <p>{formatDateTime(sale.date)}</p>
      </div>
    </header>

    <div className="mt-3 flex justify-between">
      <div>
        <p className="text-slate-500">Bill to</p>
        <p className="font-semibold">{sale.customer?.name ?? "Walk-in customer"}</p>
        {sale.customer && (
          <p>
            {formatPhone(sale.customer.phone)} · {sale.customer.address}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-slate-500">Sold by</p>
        <p className="font-semibold">{sale.soldBy?.name}</p>
      </div>
    </div>

    <table className="mt-3 w-full border-collapse text-left">
      <thead>
        <tr className="bg-slate-100">
          <th className={`${cell} font-semibold`}>#</th>
          <th className={`${cell} font-semibold`}>Product</th>
          <th className={`${cell} text-right font-semibold`}>Qty</th>
          <th className={`${cell} text-right font-semibold`}>Price</th>
          <th className={`${cell} text-right font-semibold`}>Total</th>
        </tr>
      </thead>
      <tbody>
        {sale.items.map((item, i) => (
          <tr key={item.product} className="align-top">
            <td className={cell}>{i + 1}</td>
            <td className={cell}>
              {item.name}
              {item.serials.length > 0 && <span className="block font-mono text-[10px] text-slate-500">IMEI: {item.serials.join(", ")}</span>}
            </td>
            <td className={`${cell} text-right`}>{item.quantity}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.unitPrice)}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="ml-auto mt-3 w-64 space-y-0.5">
      <TotalRow label="Sub Total" value={sale.subTotal} />
      {sale.discount > 0 && <TotalRow label="Discount" value={-sale.discount} />}
      {sale.deliveryCharge > 0 && <TotalRow label="Delivery Charge" value={sale.deliveryCharge} />}
      <TotalRow label="Grand Total" value={sale.grandTotal} strong />
      <TotalRow label={`Paid${sale.payments.length ? ` (${sale.payments.map((p) => p.paymentMethod?.name).join(", ")})` : ""}`} value={sale.paidAmount} />
      <TotalRow label="Due" value={sale.dueAmount} strong={sale.dueAmount > 0} />
    </div>

    {sale.note && <p className="mt-3">Note: {sale.note}</p>}

    <footer className="mt-10 flex justify-between text-slate-500">
      <span className="border-t border-slate-400 pt-1">Customer signature</span>
      <span>Thank you for shopping with {BUSINESS_NAME}</span>
      <span className="border-t border-slate-400 pt-1">Authorized signature</span>
    </footer>
  </div>
);

export default SaleInvoicePrint;
