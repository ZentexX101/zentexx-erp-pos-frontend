import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Spinner from "../../components/common/loaders/Spinner";
import AddStockModal from "../../components/product/AddStockModal";
import ProductDetailHeader from "../../components/product/ProductDetailHeader";
import ProductStockSummary from "../../components/product/ProductStockSummary";
import ProductUnitFilters from "../../components/product/ProductUnitFilters";
import ProductUnitTable from "../../components/product/ProductUnitTable";
import BranchStockCards from "../../components/stockCenter/BranchStockCards";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useProductStockData, useProductUnitsData } from "../../hooks/useProductApi";
import { hasPermission } from "../../utils/access";

const NO_FILTERS = { status: "", branch: "" };

// Product details (main admin): how many pieces each branch has, and every IMEI with its status,
// where it came from and the sale that took it out
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enterBranch } = useBranch();
  const canAddStock = hasPermission(user, "purchase.create");

  // all states
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [addingStock, setAddingStock] = useState(false);

  // call product api (search, filters and paging run on the backend)
  const { data: stock, isLoading: stockLoading, error: stockError } = useProductStockData(id);
  const trackSerial = Boolean(stock?.product?.trackSerial);
  const { data, isLoading, error: unitError } = useProductUnitsData(id, { ...filters, search, page, limit }, { enabled: trackSerial });

  const branches = stock?.branches ?? [];
  const hasFilters = Boolean(search || filters.status || filters.branch);

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setFilters(NO_FILTERS);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  // Enter the picked branch (like "Login" on the branch list) and open Add Purchase with this product in it
  const handleAddStock = (branch) => {
    enterBranch(branch);
    navigate(ROUTES.BRANCH_PURCHASE_NEW, { state: { product: stock.product } });
  };

  return (
    <div className="space-y-4">
      <ProductDetailHeader product={stock?.product} canAddStock={canAddStock} onAddStock={() => setAddingStock(true)} />
      <AddStockModal
        isOpen={addingStock}
        product={stock?.product}
        branches={branches}
        onClose={() => setAddingStock(false)}
        onPick={handleAddStock}
      />

      <Alert>{(stockError || unitError)?.message}</Alert>

      {stockLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-indigo-600" />
        </div>
      )}

      {stock && (
        <>
          <ProductStockSummary trackSerial={trackSerial} counts={stock.counts} stockValue={stock.stockValue} />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Stock by branch</h2>
            <BranchStockCards
              branches={branches.map((b) => ({ _id: b._id, name: b.name, units: b.quantity, value: 0 }))}
              active={filters.branch}
              onPick={(branchId) => handleFilter("branch", branchId)}
            />
          </section>

          {trackSerial ? (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">
                IMEI list
                {data?.meta && <span className="ml-2 text-sm font-normal text-slate-500">({data.meta.total.toLocaleString("en-IN")})</span>}
              </h2>
              <ProductUnitFilters
                searchInput={searchInput}
                onSearch={handleSearch}
                filters={filters}
                onFilter={handleFilter}
                onClear={handleClear}
                branches={branches}
              />
              <ProductUnitTable
                units={data?.data ?? []}
                meta={data?.meta}
                isLoading={isLoading}
                hasFilters={hasFilters}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
              />
            </section>
          ) : (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
              This product is counted by quantity only, so it has no IMEI list. Turn on "Track IMEI / Serial number" on a product to
              record each piece's IMEI when it's purchased.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetail;
