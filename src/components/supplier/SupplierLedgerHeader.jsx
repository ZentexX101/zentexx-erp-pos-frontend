import { LuArrowLeft, LuPrinter } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../common/buttons/Button";
import PageHeader from "../common/layout/PageHeader";

// Back link, title and the "Generate PDF" button
const SupplierLedgerHeader = ({ onPrint, printing, canPrint }) => (
  <div className="space-y-3">
    <Link to={ROUTES.SUPPLIERS} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
      <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to suppliers
    </Link>
    <PageHeader
      title="Supplier Ledger"
      subtitle="Every purchase, return and payment with this supplier, newest first"
      actions={
        <Button onClick={onPrint} loading={printing} disabled={!canPrint} className="bg-slate-900 hover:bg-slate-800">
          {!printing && <LuPrinter className="h-4 w-4" aria-hidden="true" />}
          Generate PDF
        </Button>
      }
    />
  </div>
);

export default SupplierLedgerHeader;
