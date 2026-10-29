import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import PurchaseListFilters from "../../components/purchase/PurchaseListFilters";
import PurchaseReturnDetailsModal from "../../components/purchase/PurchaseReturnDetailsModal";
import PurchaseReturnTable from "../../components/purchase/PurchaseReturnTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePurchaseReturnsData } from "../../hooks/usePurchaseApi";
import { hasPermission } from "../../utils/access";

const NO_DATES = { from: "", to: "" };

const PurchaseReturns = () => {
  const { user } = useAuth();

  // all states
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [dates, setDates] = useState(NO_DATES);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);

  // call purchase return api (search, dates and paging run on the backend)
  const { data, isLoading, error } = usePurchaseReturnsData({ search, ...dates, page, limit });

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleDate = (name, value) => {
    setDates((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Return List"
        subtitle="Products sent back to suppliers from this branch"
        actions={
          hasPermission(user, "purchase.return") && (
            <Link
              to={ROUTES.BRANCH_PURCHASE_RETURN_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              Add Purchase Return
            </Link>
          )
        }
      />

      <PurchaseListFilters
        searchInput={searchInput}
        onSearch={handleSearch}
        filters={dates}
        onFilter={handleDate}
        searchPlaceholder="Search return no. or supplier..."
      />

      <Alert>{error?.message}</Alert>

      <PurchaseReturnTable
        returns={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || dates.from || dates.to)}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <PurchaseReturnDetailsModal purchaseReturn={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default PurchaseReturns;
