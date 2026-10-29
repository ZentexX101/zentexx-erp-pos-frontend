import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import CustomerSelect from "../../components/customer/CustomerSelect";
import SaleReturnDetailsModal from "../../components/saleReturn/SaleReturnDetailsModal";
import SaleReturnTable from "../../components/saleReturn/SaleReturnTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSaleReturnsData } from "../../hooks/useSaleReturnApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";

// POS Return Orders List: this branch's returns
const PosReturns = () => {
  const { user } = useAuth();

  // all states
  const [period, setPeriod] = useState({ period: "today", from: "", to: "" });
  const [customer, setCustomer] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);

  // call pos return api (period, customer, search and paging run on the backend)
  const { data, isLoading, error } = useSaleReturnsData({ search, customer: customer?._id, ...periodRange(period.period, period), page, limit });
  const summary = data?.meta?.summary;

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="POS Return Orders List"
        subtitle="Manage all POS return orders"
        actions={
          hasPermission(user, "return.create") && (
            <Link
              to={ROUTES.BRANCH_POS_RETURN}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              Create POS Return
            </Link>
          )
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Search by Return ID or Order ID..." />}>
          <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
          <div className="col-span-2 w-72">
            <CustomerSelect label="Customer" value={customer} onChange={withPageReset(setCustomer)} />
          </div>
        </FilterBar>
        {summary && (
          <p className="text-sm text-slate-600">
            {summary.count} return{summary.count === 1 ? "" : "s"} · Total <span className="font-bold text-slate-900">{formatTaka(summary.total)}</span> ·
            Refunded <span className="font-bold text-orange-600">{formatTaka(summary.refund)}</span>
          </p>
        )}
      </div>

      <Alert>{error?.message}</Alert>

      <SaleReturnTable
        returns={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || customer) || period.period !== "all"}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      <SaleReturnDetailsModal saleReturn={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default PosReturns;
