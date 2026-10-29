import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import PaymentDetailsModal from "../../components/payment/PaymentDetailsModal";
import PaymentListFilters from "../../components/payment/PaymentListFilters";
import PaymentTable from "../../components/payment/PaymentTable";
import { CUSTOMER_PAYMENT_KINDS } from "../../constants/customerPayment";
import { useBranchOptionsData } from "../../hooks/useBranchApi";
import { useAllCustomerPaymentsData } from "../../hooks/useCustomerPaymentApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { periodRange } from "../../utils/period";

// Main admin panel: every branch's customer payments (kind "payment") or payouts ("payout")
const AllCustomerPaymentList = ({ kind }) => {
  const copy = CUSTOMER_PAYMENT_KINDS[kind];

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [branch, setBranch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);

  // call customer payment api (filters and paging run on the backend)
  const { data, isLoading, error } = useAllCustomerPaymentsData(kind, { search, branch, ...periodRange(period.period, period), page, limit });
  const { data: branches = [] } = useBranchOptionsData();

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader title={copy.listTitle} subtitle={`${copy.subtitle} in every branch. They are made from inside a branch.`} />

      <PaymentListFilters
        searchPlaceholder={`Search ${copy.noun} no., customer name or phone...`}
        period={period}
        onPeriod={withPageReset(setPeriod)}
        searchInput={searchInput}
        onSearch={withPageReset(setSearchInput)}
        branches={branches}
        branch={branch}
        onBranch={withPageReset(setBranch)}
        summary={data?.meta?.summary}
        noun={copy.noun}
      />

      <Alert>{error?.message}</Alert>

      <PaymentTable
        party="customer"
        noun={`customer ${copy.noun}`}
        showBranch
        payments={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || branch) || period.period !== "all"}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      <PaymentDetailsModal party="customer" payment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default AllCustomerPaymentList;
