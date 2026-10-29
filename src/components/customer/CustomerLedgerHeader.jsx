import { LuArrowLeft, LuPrinter } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../common/buttons/Button";
import PageHeader from "../common/layout/PageHeader";

// Back link, title and the "Generate PDF" button
const CustomerLedgerHeader = ({ onPrint, printing, canPrint }) => (
  <div className="space-y-3">
    <Link to={ROUTES.CUSTOMERS} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
      <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to customers
    </Link>
    <PageHeader
      title="Customer Ledger"
      subtitle="Every sale, return, payment and payout with this customer, newest first"
      actions={
        <Button onClick={onPrint} loading={printing} disabled={!canPrint} className="bg-slate-900 hover:bg-slate-800">
          {!printing && <LuPrinter className="h-4 w-4" aria-hidden="true" />}
          Generate PDF
        </Button>
      }
    />
  </div>
);

export default CustomerLedgerHeader;
