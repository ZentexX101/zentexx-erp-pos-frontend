import { LuBarcode, LuDownload, LuRefreshCw } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../common/buttons/Button";
import PageHeader from "../common/layout/PageHeader";

// Title with "Barcode Labels", "Download PDF" (stock.export) and "Sync Products" (stock.edit)
const StockHeader = ({ canExport, canSync, onPrint, printing, onSync, syncing }) => (
  <PageHeader
    title="Stock"
    subtitle="Every product of this branch with its quantity and prices"
    actions={
      <>
        <Link
          to={ROUTES.BRANCH_BARCODE_LABELS}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
        >
          <LuBarcode className="h-4 w-4" aria-hidden="true" />
          Barcode Labels
        </Link>
        {canExport && (
          <Button variant="secondary" onClick={onPrint} loading={printing}>
            {!printing && <LuDownload className="h-4 w-4" aria-hidden="true" />}
            Download PDF
          </Button>
        )}
        {canSync && (
          <Button onClick={onSync} loading={syncing} title="Add every active product to this branch's stock (quantity 0)">
            {!syncing && <LuRefreshCw className="h-4 w-4" aria-hidden="true" />}
            Sync Products
          </Button>
        )}
      </>
    }
  />
);

export default StockHeader;
