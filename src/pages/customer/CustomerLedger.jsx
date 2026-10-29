import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Spinner from "../../components/common/loaders/Spinner";
import CustomerLedgerFilters from "../../components/customer/CustomerLedgerFilters";
import CustomerLedgerHeader from "../../components/customer/CustomerLedgerHeader";
import CustomerLedgerPrint from "../../components/customer/CustomerLedgerPrint";
import CustomerLedgerSummary from "../../components/customer/CustomerLedgerSummary";
import CustomerLedgerTable from "../../components/customer/CustomerLedgerTable";
import { useFetchFullCustomerLedger, useCustomerLedgerData } from "../../hooks/useCustomerApi";

const NO_FILTERS = { from: "", to: "", type: "" };

const CustomerLedger = () => {
  const { id } = useParams();

  // all states
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [printData, setPrintData] = useState(null); // the whole period, rendered only while printing
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  // call ledger api (filters and paging run on the backend)
  const { data, isLoading, error } = useCustomerLedgerData(id, { ...filters, page, limit });
  const fetchFullLedger = useFetchFullCustomerLedger();
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
        <CustomerLedgerHeader onPrint={handlePrint} printing={printing} canPrint={Boolean(ledger)} />

        <Alert>{error?.message || printError}</Alert>

        {ledger ? (
          <CustomerLedgerSummary customer={ledger.customer} summary={ledger.summary} hasPeriod={Boolean(filters.from)} />
        ) : (
          isLoading && (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-indigo-600" />
            </div>
          )
        )}

        {ledger && (
          <>
            <CustomerLedgerFilters filters={filters} onFilter={handleFilter} onReset={handleReset} />
            <CustomerLedgerTable
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

      {printData && <CustomerLedgerPrint {...printData.data} total={printData.meta.total} filters={filters} />}
    </div>
  );
};

export default CustomerLedger;
