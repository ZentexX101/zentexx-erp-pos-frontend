import { formatTaka } from "../../utils/money";

const wide = "hidden sm:table-cell";

// The product lines of a purchase or return, with their IMEIs. showSalePrice for purchases.
// Phones: qty × cost (and the sale price) sit under the product, so only Product and Total are columns.
const InvoiceItemsTable = ({ items, total, showSalePrice = false }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full text-left text-sm sm:min-w-[560px]">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="px-3 py-2 font-semibold">Product</th>
          <th className={`px-3 py-2 text-right font-semibold ${wide}`}>Qty</th>
          <th className={`px-3 py-2 text-right font-semibold ${wide}`}>Unit Cost</th>
          {showSalePrice && <th className={`px-3 py-2 text-right font-semibold ${wide}`}>Sale Price</th>}
          <th className="px-3 py-2 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {items.map((item) => (
          <tr key={item.product} className="align-top">
            <td className="px-3 py-2">
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-xs tabular-nums text-slate-500 sm:hidden">
                {item.quantity} × {formatTaka(item.unitCost)}
                {showSalePrice && item.salePrice ? ` · sells ${formatTaka(item.salePrice)}` : ""}
              </p>
              {item.serials.length > 0 && <p className="mt-0.5 break-all font-mono text-xs text-slate-500">{item.serials.join(", ")}</p>}
            </td>
            <td className={`px-3 py-2 text-right ${wide}`}>{item.quantity}</td>
            <td className={`whitespace-nowrap px-3 py-2 text-right ${wide}`}>{formatTaka(item.unitCost)}</td>
            {showSalePrice && <td className={`whitespace-nowrap px-3 py-2 text-right ${wide}`}>{formatTaka(item.salePrice)}</td>}
            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{formatTaka(item.total)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
        <tr>
          <td className="px-3 py-2 sm:hidden">Total</td>
          <td colSpan={showSalePrice ? 4 : 3} className={`px-3 py-2 ${wide}`}>
            Total
          </td>
          <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default InvoiceItemsTable;
