import { LuArrowLeft, LuDownload } from "react-icons/lu";
import { Link } from "react-router";
import { BUSINESS_NAME } from "../../constants/app";
import { ROUTES } from "../../constants/routes";
import { formatDateTime, todayInputValue } from "../../utils/formatDate";
import Button from "../common/buttons/Button";

const FIELD_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Back link, title, the date range and "Download PDF". When printing, only a statement heading shows.
const PaymentMethodStatementHeader = ({ name, branchName, filters, onFilter, onPrint, canPrint }) => (
  <>
    <div className="space-y-3 print:hidden">
      <Link
        to={ROUTES.BRANCH_PAYMENT_METHODS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to payment methods
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payment Method Statement</h1>
          <p className="mt-1 text-sm text-slate-500">Statement for {name || "…"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="From date"
            value={filters.from}
            max={filters.to || todayInputValue()}
            onChange={(e) => onFilter("from", e.target.value)}
            className={FIELD_CLASS}
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="date"
            aria-label="To date"
            value={filters.to}
            min={filters.from || undefined}
            max={todayInputValue()}
            onChange={(e) => onFilter("to", e.target.value)}
            className={FIELD_CLASS}
          />
          <Button onClick={onPrint} disabled={!canPrint} className="bg-slate-900 hover:bg-slate-800">
            <LuDownload className="h-4 w-4" aria-hidden="true" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>

    {/* Print only */}
    <header className="hidden border-b-2 border-slate-800 pb-3 print:block">
      <h1 className="text-xl font-bold">{BUSINESS_NAME}</h1>
      <p className="text-sm font-semibold text-slate-600">
        Payment Method Statement{branchName && ` · Branch: ${branchName}`}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Period: {filters.from || "Start"} to {filters.to || todayInputValue()} · Printed {formatDateTime(new Date())}
      </p>
    </header>
  </>
);

export default PaymentMethodStatementHeader;
