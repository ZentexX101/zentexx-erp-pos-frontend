import darkLogo from "../../assets/decent-logo-dark.png";
import { BUSINESS_NAME } from "../../constants/app";
import { formatDateTime } from "../../utils/formatDate";
import { rangeText } from "../../utils/period";

// Plain rows shared by the printed reports: thin rules, right-aligned money, nothing that needs background printing
export const printCell = "border-b border-slate-200 px-2 py-1 align-top";
export const printMoney = `${printCell} whitespace-nowrap text-right tabular-nums`;
export const printHead = "border-b border-slate-800 px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wide";
export const printHeadRight = `${printHead} text-right`;
export const printTotal = "border-t border-slate-800 px-2 py-1.5 font-bold";

// A printed report on A4: only visible on paper. @page margin 0 stops the browser adding its URL and date;
// the empty head / foot rows repeat on every page and give each page its margin instead.
const ReportPrintShell = ({ title, branchName, range, children }) => (
  <div className="hidden text-[11px] leading-snug text-slate-900 print:block">
    <style>{"@media print { @page { size: A4; margin: 0; } html, body { background: #fff; } }"}</style>
    <table className="w-full">
      <thead>
        <tr>
          <td className="h-[12mm]" />
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td className="h-[12mm]" />
        </tr>
      </tfoot>
      <tbody>
        <tr>
          <td className="px-[14mm]">
            <header className="flex items-start justify-between gap-6 border-b-2 border-slate-800 pb-3">
              <div>
                <img src={darkLogo} alt={BUSINESS_NAME} className="h-8 w-auto" />
                <p className="mt-1.5 text-xs font-semibold">{BUSINESS_NAME}</p>
              </div>
              <div className="text-right">
                <h1 className="text-lg font-bold">{title}</h1>
                <p className="font-medium">{branchName}</p>
                <p>{rangeText(range)}</p>
                <p className="text-[10px] text-slate-500">Printed {formatDateTime(new Date())}</p>
              </div>
            </header>

            <div className="mt-4 space-y-4">{children}</div>

            <div className="mt-14 grid grid-cols-2 gap-16 break-inside-avoid text-center text-[10px] text-slate-600">
              <p className="border-t border-slate-400 pt-1">Prepared by</p>
              <p className="border-t border-slate-400 pt-1">Checked by</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ReportPrintShell;
