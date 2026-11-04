import { formatDateTime } from "../../utils/formatDate";
import { monthLabel } from "../../utils/hr";
import { formatTaka, takaInWords } from "../../utils/money";
import ReportPrintShell, { printCell, printHead, printHeadRight, printMoney } from "../report/ReportPrintShell";

const Row = ({ label, value, less }) => (
  <tr>
    <td className={printCell}>{label}</td>
    <td className={printMoney}>
      {less && value > 0 ? "− " : ""}
      {formatTaka(value)}
    </td>
  </tr>
);

// A salary slip on paper (only visible when printing)
const PayslipPrint = ({ slip }) => {
  const [year, month] = slip.month.split("-").map(Number);
  const last = new Date(year, month, 0).getDate();
  return (
    <ReportPrintShell
      title="Salary Slip"
      branchName={slip.branch?.name ?? ""}
      range={{ from: `${slip.month}-01`, to: `${slip.month}-${String(last).padStart(2, "0")}` }}
    >
      <dl className="grid grid-cols-2 gap-x-8 gap-y-1">
        <div>
          <dt className="inline font-semibold">Name: </dt>
          <dd className="inline">{slip.user?.name}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Slip no: </dt>
          <dd className="inline">{slip.slipNo}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Designation: </dt>
          <dd className="inline">{slip.user?.designation || "—"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Month: </dt>
          <dd className="inline">{monthLabel(slip.month)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Staff ID: </dt>
          <dd className="inline">{slip.user?.staffCode || "—"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Paid on: </dt>
          <dd className="inline">{formatDateTime(slip.date)}</dd>
        </div>
      </dl>

      <p>
        Present {slip.presentDays} · Paid leave {slip.leaveDays} · Days cut {slip.absentDays} · Days in month {slip.daysInMonth}
      </p>

      <table className="w-full">
        <thead>
          <tr>
            <th className={printHead}>Particulars</th>
            <th className={printHeadRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Salary" value={slip.basic} />
          <Row label="Absence" value={slip.absentDeduction} less />
          <Row label="Bonus" value={slip.bonus} />
          <Row label="Other deduction" value={slip.otherDeduction} less />
          <Row label="Incentive" value={slip.incentive} />
          <Row label="Advance taken back" value={slip.advanceDeducted} less />
          <tr className="text-sm font-bold">
            <td className="border-y-2 border-slate-800 px-2 py-2">Paid</td>
            <td className="whitespace-nowrap border-y-2 border-slate-800 px-2 py-2 text-right tabular-nums">{formatTaka(slip.netPaid)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        <span className="font-semibold">In words:</span> {takaInWords(slip.netPaid)}
      </p>
      {slip.payments.length > 0 && <p>Paid from: {slip.payments.map((line) => `${line.paymentMethod?.name ?? "—"} ${formatTaka(line.amount)}`).join(" · ")}</p>}
      {slip.note && <p>Note: {slip.note}</p>}
    </ReportPrintShell>
  );
};

export default PayslipPrint;
