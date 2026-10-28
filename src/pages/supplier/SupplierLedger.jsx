import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Spinner from "../../components/common/loaders/Spinner";
import SupplierLedgerFilters from "../../components/supplier/SupplierLedgerFilters";
import SupplierLedgerHeader from "../../components/supplier/SupplierLedgerHeader";
import SupplierLedgerPrint from "../../components/supplier/SupplierLedgerPrint";
import SupplierLedgerSummary from "../../components/supplier/SupplierLedgerSummary";
import SupplierLedgerTable from "../../components/supplier/SupplierLedgerTable";
import { useFetchFullSupplierLedger, useSupplierLedgerData } from "../../hooks/useSupplierApi";

const NO_FILTERS = { from: "", to: "", type: "" };

const SupplierLedger = () => {
  const { id } = useParams();

  // all states
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [printData, setPrintData] = useState(null); // the whole period, rendered only while printing
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  // call ledger api (filters and paging run on the backend)
  const { data, isLoading, error } = useSupplierLedgerData(id, { ...filters, page, limit });
  const fetchFullLedger = useFetchFullSupplierLedger();
  const ledger = data?.data;
  const hasFilters = Boolean(filters.from || filters.to || filters.type);

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  // Generate PDF: load every entry of the filtered period, then open the browser's print / save-as-PDF dialog
  const handlePrint = async () => {
    setPrintError("");
    setPrinting(true);
    try {
      setPrintData(await fetchFullLedger(id, filters));
    } catch (err) {
      setPrintError(err.message);
    } finally {
      setPrinting(false);
    }
  };

  // The statement is on the page now; print it and drop it again afterwards
  useEffect(() => {
    if (!printData) return;
    const clear = () => setPrintData(null);
    window.addEventListener("afterprint", clear, { once: true });
    window.print();
    return () => window.removeEventListener("afterprint", clear);
  }, [printData]);

  return (
    <div>
      <div className="space-y-4 print:hidden">
        <SupplierLedgerHeader onPrint={handlePrint} printing={printing} canPrint={Boolean(ledger)} />

        <Alert>{error?.message || printError}</Alert>

        {ledger ? (
          <SupplierLedgerSummary supplier={ledger.supplier} summary={ledger.summary} hasPeriod={Boolean(filters.from)} />
        ) : (
          isLoading && (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-indigo-600" />
            </div>
          )
        )}

        {ledger && (
          <>
            <SupplierLedgerFilters filters={filters} onFilter={handleFilter} onReset={handleReset} />
            <SupplierLedgerTable
              entries={ledger.entries}
              meta={data.meta}
              isLoading={isLoading}
              hasFilters={hasFilters}
              onPageChange={setPage}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>

      {printData && <SupplierLedgerPrint {...printData.data} total={printData.meta.total} filters={filters} />}
    </div>
  );
};

export default SupplierLedger;
