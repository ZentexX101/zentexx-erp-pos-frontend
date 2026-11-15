import { Fragment } from "react";
import { BUSINESS_NAME } from "../../constants/app";
import { conditionText, tradeInSourceText } from "../../utils/exchange";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import { variantDetails } from "../../utils/productVariant";

const cell = "border-b border-slate-200 px-2 py-1";

const TotalRow = ({ label, value, strong }) => (
  <div className={`flex justify-between ${strong ? "border-t border-slate-800 pt-1 text-sm font-bold" : ""}`}>
    <span>{label}</span>
    <span>{formatTaka(value)}</span>
  </div>
);

// Printable invoice of one sale (only visible when printing). An exchange with no new items is a buyback receipt.
// Any old device taken in adds the seller's declaration and signatures.
const SaleInvoicePrint = ({ sale }) => {
  const tradeIns = sale.tradeIns ?? [];
  const sells = sale.items.length + (sale.externalItems ?? []).length > 0;
  const title = sale.kind === "exchange" ? (sells ? "EXCHANGE INVOICE" : "BUYBACK RECEIPT") : "INVOICE";

  return (
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
        <p className="text-base font-bold">{title}</p>
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

    {sells && (
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
          <Fragment key={item.product}>
          <tr className="align-top">
            <td className={cell}>{i + 1}</td>
            <td className={cell}>
              {item.name}
              {variantDetails(item.variant) && <span className="block text-[10px] text-slate-600">{variantDetails(item.variant)}</span>}
              {item.serials.length > 0 && <span className="block font-mono text-[10px] text-slate-600">IMEI: {item.serials.join(", ")}</span>}
              {item.productCode && <span className="block font-mono text-[10px] text-slate-600">IMEI / ID: {item.productCode}</span>}
            </td>
            <td className={`${cell} text-right`}>{item.quantity}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.unitPrice)}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.total)}</td>
          </tr>
          {/* Services sold with the product, each on its own line under it */}
          {(item.services ?? []).map((row) => (
            <tr key={`${item.product}-${row.service}`} className="align-top">
              <td className={cell} />
              <td className={cell}>
                <span className="pl-3">↳ {row.name}</span>
                <span className="block pl-3 text-[10px] text-slate-600">{row.pricePercent}% of {formatTaka(item.unitPrice)}, for {item.name}</span>
              </td>
              <td className={`${cell} text-right`}>{row.quantity}</td>
              <td className={`${cell} text-right`}>{formatTaka(row.unitPrice)}</td>
              <td className={`${cell} text-right`}>{formatTaka(row.price)}</td>
            </tr>
          ))}
          </Fragment>
        ))}
        {(sale.externalItems ?? []).map((item, i) => (
          <tr key={`external-${i}`} className="align-top">
            <td className={cell}>{sale.items.length + i + 1}</td>
            <td className={cell}>
              {item.name}
              {item.productCode && <span className="block font-mono text-[10px] text-slate-600">IMEI / ID: {item.productCode}</span>}
            </td>
            <td className={`${cell} text-right`}>{item.quantity}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.unitPrice)}</td>
            <td className={`${cell} text-right`}>{formatTaka(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    )}

    {tradeIns.length > 0 && (
      <table className="mt-3 w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-100">
            <th className={`${cell} font-semibold`} colSpan={2}>
              Old device(s) taken in (Buyback)
            </th>
            <th className={`${cell} text-right font-semibold`}>Qty</th>
            <th className={`${cell} text-right font-semibold`}>Value</th>
            <th className={`${cell} text-right font-semibold`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {tradeIns.map((line, i) => (
            <tr key={i} className="align-top">
              <td className={cell}>{i + 1}</td>
              <td className={cell}>
                {line.name}
                {line.serials.length > 0 && <span className="block font-mono text-[10px] text-slate-600">IMEI: {line.serials.join(", ")}</span>}
                {line.source && <span className="block text-[10px] text-slate-600">{tradeInSourceText(line.source)}</span>}
                {conditionText(line.condition) && <span className="block text-[10px] text-slate-600">Condition: {conditionText(line.condition)}</span>}
              </td>
              <td className={`${cell} text-right`}>{line.quantity}</td>
              <td className={`${cell} text-right`}>{formatTaka(line.value)}</td>
              <td className={`${cell} text-right`}>−{formatTaka(line.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    <div className="ml-auto mt-3 w-64 space-y-0.5">
      {sells && (
        <>
          <TotalRow label="Sub Total" value={sale.subTotal} />
          {sale.discount > 0 && <TotalRow label="Discount" value={-sale.discount} />}
          {sale.deliveryCharge > 0 && <TotalRow label="Delivery Charge" value={sale.deliveryCharge} />}
          <TotalRow label="Grand Total" value={sale.grandTotal} strong />
        </>
      )}
      {sale.exchangeValue > 0 && <TotalRow label="Old Device Value" value={-sale.exchangeValue} />}
      {sale.exchangeValue > 0 && <TotalRow label={sale.payable < 0 ? "We Pay You" : "Payable"} value={Math.abs(sale.payable)} strong />}
      {sale.payoutAmount > 0 && <TotalRow label="Paid Out" value={sale.payoutAmount} />}
      {sale.advanceAmount > 0 && <TotalRow label={`Advance (${sale.preOrderNo})`} value={sale.advanceAmount} />}
      <TotalRow
        label={`Paid${sale.payments.length === 1 && !sale.payments[0].txnId ? ` (${sale.payments[0].paymentMethod?.name ?? "—"})` : ""}`}
        value={Math.round((sale.paidAmount - (sale.advanceAmount ?? 0)) * 100) / 100}
      />
      {/* How much came through each method, with its Txn ID (shown when split, or when a Txn ID was given) */}
      {(sale.payments.length > 1 || sale.payments.some((line) => line.txnId)) &&
        sale.payments.map((line, index) => (
          <div key={line._id ?? index} className="flex justify-between gap-2 pl-3 text-[11px] text-slate-600">
            <span>
              • {line.paymentMethod?.name ?? "—"}
              {line.txnId && <span className="font-mono text-[10px]"> (Txn: {line.txnId})</span>}
            </span>
            <span>{formatTaka(line.amount)}</span>
          </div>
        ))}
      <TotalRow label="Due" value={sale.dueAmount} strong={sale.dueAmount > 0} />
    </div>

    {sale.note && <p className="mt-3">Note: {sale.note}</p>}

    {tradeIns.length > 0 && (
      <p className="mt-4 rounded border border-slate-300 p-2 text-[10px]">
        <span className="font-semibold">Seller&apos;s declaration / বিক্রেতার ঘোষণা:</span> I confirm the old device(s) above are my own and not
        stolen, lost, financed or pledged. এই ডিভাইস আমার নিজের, চুরি বা বন্ধক রাখা নয়।
      </p>
    )}

    <footer className="mt-10 flex justify-between text-slate-500">
      <span className="border-t border-slate-400 pt-1">{tradeIns.length > 0 ? "Customer / seller signature" : "Customer signature"}</span>
      <span>Thank you for shopping with {BUSINESS_NAME}</span>
      <span className="border-t border-slate-400 pt-1">Authorized signature</span>
    </footer>
  </div>
  );
};

export default SaleInvoicePrint;
