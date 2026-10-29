import { formatTaka } from "../../utils/money";

// The product lines of a purchase or return, with their IMEIs. showSalePrice for purchases.
const InvoiceItemsTable = ({ items, total, showSalePrice = false }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="px-3 py-2 font-semibold">Product</th>
          <th className="px-3 py-2 text-right font-semibold">Qty</th>
          <th className="px-3 py-2 text-right font-semibold">Unit Cost</th>
          {showSalePrice && <th className="px-3 py-2 text-right font-semibold">Sale Price</th>}
          <th className="px-3 py-2 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((item) => (
          <tr key={item.product} className="align-top">
            <td className="px-3 py-2">
              <p className="font-medium text-slate-900">{item.name}</p>
              {item.serials.length > 0 && <p className="mt-0.5 break-all font-mono text-xs text-slate-500">{item.serials.join(", ")}</p>}
            </td>
            <td className="px-3 py-2 text-right">{item.quantity}</td>
            <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(item.unitCost)}</td>
            {showSalePrice && <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(item.salePrice)}</td>}
            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{formatTaka(item.total)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
        <tr>
          <td colSpan={showSalePrice ? 4 : 3} className="px-3 py-2">
            Total
          </td>
          <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default InvoiceItemsTable;
