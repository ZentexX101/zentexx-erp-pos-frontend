import { BUSINESS_NAME } from "../../constants/app";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";

const cell = "border-b border-slate-200 px-2 py-1";

// Printable stock report (only visible when printing): every filtered row with the totals
const StockPrint = ({ rows, summary, total, branchName }) => (
  <div className="hidden text-[11px] text-slate-800 print:block">
    <header className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
      <div>
        <h1 className="text-xl font-bold">{BUSINESS_NAME}</h1>
        <p className="text-sm font-semibold text-slate-600">Stock Report{branchName && ` · Branch: ${branchName}`}</p>
      </div>
      <div className="text-right">
        <p>Products: {summary.products}</p>
        <p>Units: {summary.quantity}</p>
        <p className="font-semibold">Value: {formatTaka(summary.value)}</p>
      </div>
    </header>

    <table className="mt-3 w-full border-collapse text-left">
      <thead>
        <tr className="bg-slate-100">
          {["#", "Product", "Category", "Brand"].map((h) => (
            <th key={h} className={`${cell} font-semibold`}>
              {h}
            </th>
          ))}
          {["Qty", "Buying", "Value", "Selling"].map((h) => (
            <th key={h} className={`${cell} text-right font-semibold`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => (
          <tr key={s._id}>
            <td className={cell}>{i + 1}</td>
            <td className={cell}>{s.product?.name}</td>
            <td className={cell}>{s.product?.category?.name ?? "—"}</td>
            <td className={cell}>{s.product?.brand?.name ?? "—"}</td>
            <td className={`${cell} text-right`}>{s.quantity}</td>
            <td className={`${cell} text-right`}>{formatTaka(s.purchasePrice)}</td>
            <td className={`${cell} text-right`}>{formatTaka(s.quantity * s.purchasePrice)}</td>
            <td className={`${cell} text-right`}>{formatTaka(s.salePrice)}</td>
          </tr>
        ))}
        <tr className="bg-slate-100 font-semibold">
          <td className={cell} colSpan={4}>
            Total
          </td>
          <td className={`${cell} text-right`}>{summary.quantity}</td>
          <td className={cell} />
          <td className={`${cell} text-right`}>{formatTaka(summary.value)}</td>
          <td className={cell} />
        </tr>
      </tbody>
    </table>

    {rows.length < total && <p className="mt-3 text-slate-500">Showing {rows.length} of {total} rows. Narrow the filters to print the rest.</p>}

    <footer className="mt-6 border-t border-slate-200 pt-2 text-right text-slate-400">Printed {formatDateTime(new Date())}</footer>
  </div>
);

export default StockPrint;
