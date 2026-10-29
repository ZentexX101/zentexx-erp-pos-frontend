import { useEffect, useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import StockFilters from "../../components/stock/StockFilters";
import StockHeader from "../../components/stock/StockHeader";
import StockPriceModal from "../../components/stock/StockPriceModal";
import StockPrint from "../../components/stock/StockPrint";
import StockSerialsModal from "../../components/stock/StockSerialsModal";
import StockSummary from "../../components/stock/StockSummary";
import StockTable from "../../components/stock/StockTable";
import { isMainAdmin } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFetchFullStock, useStockData, useSyncStockProducts } from "../../hooks/useStockApi";
import { hasPermission } from "../../utils/access";

const NO_FILTERS = { category: "", brand: "", quantity: "" };
const NO_PRICES = { maxSalePrice: "", maxPurchasePrice: "" };

const Stock = () => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const canEdit = hasPermission(user, "stock.edit");
  const canExport = hasPermission(user, "stock.export");

  // all states
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState(NO_FILTERS);
  const [prices, setPrices] = useState(NO_PRICES);
  const debouncedPrices = useDebouncedValue(prices);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewingSerials, setViewingSerials] = useState(null);
  const [editing, setEditing] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [printing, setPrinting] = useState(false);

  // call stock api (search, filters and paging run on the backend)
  const query = { search, ...filters, ...debouncedPrices };
  const { data, isLoading, error } = useStockData({ ...query, page, limit });
  const { data: categories = [] } = useCategoryOptionsData();
  const { data: brands = [] } = useBrandOptionsData();
  const syncProducts = useSyncStockProducts();
  const fetchFullStock = useFetchFullStock();

  const resetMessages = () => {
    setNotice("");
    setActionError("");
  };

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePrice = (name, value) => {
    setPrices((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setFilters(NO_FILTERS);
    setPrices(NO_PRICES);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const handleSync = async () => {
    resetMessages();
    try {
      const { added } = await syncProducts.mutateAsync();
      setNotice(added ? `${added} product${added > 1 ? "s" : ""} added to stock with quantity 0.` : "Stock already lists every active product.");
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleSaved = (saved) => {
    setEditing(null);
    setNotice(`Prices of "${saved.product?.name}" updated.`);
  };

  // Download PDF: load every filtered row, then open the browser's print / save-as-PDF dialog
  const handlePrint = async () => {
    resetMessages();
    setPrinting(true);
    try {
      setPrintData(await fetchFullStock(query));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPrinting(false);
    }
  };

  // The report is on the page now; print it and drop it again afterwards
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
        <StockHeader
          canExport={canExport}
          canSync={canEdit}
          onPrint={handlePrint}
          printing={printing}
          onSync={handleSync}
          syncing={syncProducts.isPending}
        />

        <StockFilters
          searchInput={searchInput}
          onSearch={handleSearch}
          filters={filters}
          prices={prices}
          onFilter={handleFilter}
          onPrice={handlePrice}
          onClear={handleClear}
          categories={categories}
          brands={brands}
        />

        <StockSummary summary={data?.meta?.summary} />

        <Alert type="success">{notice}</Alert>
        <Alert>{error?.message || actionError}</Alert>

        <StockTable
          rows={data?.data ?? []}
          meta={data?.meta}
          isLoading={isLoading}
          hasFilters={Boolean(search || Object.values(filters).some(Boolean) || Object.values(prices).some(Boolean))}
          canEdit={canEdit}
          onSerials={setViewingSerials}
          onEdit={(stock) => {
            resetMessages();
            setEditing(stock);
          }}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />

        <StockSerialsModal stock={viewingSerials} onClose={() => setViewingSerials(null)} />

        {editing && (
          <StockPriceModal stock={editing} canEditCost={isMainAdmin(user)} onClose={() => setEditing(null)} onSaved={handleSaved} />
        )}
      </div>

      {printData && (
        <StockPrint rows={printData.data} summary={printData.meta.summary} total={printData.meta.total} branchName={activeBranch?.name} />
      )}
    </div>
  );
};

export default Stock;
