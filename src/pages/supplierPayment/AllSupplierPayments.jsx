import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import PaymentDetailsModal from "../../components/payment/PaymentDetailsModal";
import PaymentListFilters from "../../components/payment/PaymentListFilters";
import PaymentTable from "../../components/payment/PaymentTable";
import { useBranchOptionsData } from "../../hooks/useBranchApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useAllSupplierPaymentsData } from "../../hooks/useSupplierPaymentApi";
import { periodRange } from "../../utils/period";

// Main admin panel "Supplier Payment Lists": every branch's payments (made from inside a branch)
const AllSupplierPayments = () => {
  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [branch, setBranch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);

  // call supplier payment api (filters and paging run on the backend)
  const { data, isLoading, error } = useAllSupplierPaymentsData({ search, branch, ...periodRange(period.period, period), page, limit });
  const { data: branches = [] } = useBranchOptionsData();

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Supplier Payment Lists" subtitle="Supplier payments from every branch. Payments are made from inside a branch." />

      <PaymentListFilters
        searchPlaceholder="Search payment no. or supplier..."
        period={period}
        onPeriod={withPageReset(setPeriod)}
        searchInput={searchInput}
        onSearch={withPageReset(setSearchInput)}
        branches={branches}
        branch={branch}
        onBranch={withPageReset(setBranch)}
        summary={data?.meta?.summary}
      />

      <Alert>{error?.message}</Alert>

      <PaymentTable
        party="supplier"
        noun="supplier payment"
        payments={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || branch) || period.period !== "all"}
        showBranch
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      <PaymentDetailsModal party="supplier" payment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default AllSupplierPayments;
