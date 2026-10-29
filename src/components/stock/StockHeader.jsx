import { LuDownload, LuRefreshCw } from "react-icons/lu";
import Button from "../common/buttons/Button";
import PageHeader from "../common/layout/PageHeader";

// Title with "Download PDF" (stock.export) and "Sync Products" (stock.edit)
const StockHeader = ({ canExport, canSync, onPrint, printing, onSync, syncing }) => (
  <PageHeader
    title="Stock"
    subtitle="Every product of this branch with its quantity and prices"
    actions={
      <>
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
