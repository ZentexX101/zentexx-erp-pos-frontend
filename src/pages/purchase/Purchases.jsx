import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import PurchaseDetailsModal from "../../components/purchase/PurchaseDetailsModal";
import PurchaseListFilters from "../../components/purchase/PurchaseListFilters";
import PurchaseTable from "../../components/purchase/PurchaseTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePurchasesData } from "../../hooks/usePurchaseApi";
import { hasPermission } from "../../utils/access";

const NO_DATES = { from: "", to: "" };

const Purchases = () => {
  const { user } = useAuth();

  // all states
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [dates, setDates] = useState(NO_DATES);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);

  // call purchase api (search, dates and paging run on the backend)
  const { data, isLoading, error } = usePurchasesData({ search, ...dates, page, limit });

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
        title="Purchase List"
        subtitle="Every purchase invoice of this branch"
        actions={
          hasPermission(user, "purchase.create") && (
            <Link
              to={ROUTES.BRANCH_PURCHASE_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              Add Purchase
            </Link>
          )
        }
      />

      <PurchaseListFilters
        searchInput={searchInput}
        onSearch={handleSearch}
        filters={dates}
        onFilter={handleDate}
        searchPlaceholder="Search invoice or supplier..."
      />

      <Alert>{error?.message}</Alert>

      <PurchaseTable
        purchases={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || dates.from || dates.to)}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <PurchaseDetailsModal purchase={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default Purchases;
