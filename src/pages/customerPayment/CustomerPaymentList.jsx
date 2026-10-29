import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import CustomerPaymentFormModal from "../../components/customerPayment/CustomerPaymentFormModal";
import PaymentDetailsModal from "../../components/payment/PaymentDetailsModal";
import PaymentListFilters from "../../components/payment/PaymentListFilters";
import PaymentTable from "../../components/payment/PaymentTable";
import { CUSTOMER_PAYMENT_KINDS } from "../../constants/customerPayment";
import { useAuth } from "../../hooks/useAuth";
import { useCustomerPaymentsData } from "../../hooks/useCustomerPaymentApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";

// Branch panel: this branch's customer payments (kind "payment") or payouts ("payout")
const CustomerPaymentList = ({ kind }) => {
  const copy = CUSTOMER_PAYMENT_KINDS[kind];
  const { user } = useAuth();
  const canCreate = hasPermission(user, "payment.create");

  // all states
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState({ period: "today", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);

  // call customer payment api (period, search and paging run on the backend)
  const { data, isLoading, error } = useCustomerPaymentsData(kind, { search, ...periodRange(period.period, period), page, limit });

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSaved = (saved) => {
    setCreating(false);
    setNotice(
      `${saved.paymentNo}: ${formatTaka(saved.totalAmount)} ${kind === "payment" ? "received from" : "paid to"} ${saved.customer?.name}.`
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setNotice("");
                setCreating(true);
              }}
            >
              <Icon name="plus" />
              {copy.createLabel}
            </Button>
          )
        }
      />

      <PaymentListFilters
        searchPlaceholder={`Search ${copy.noun} no., customer name or phone...`}
        period={period}
        onPeriod={withPageReset(setPeriod)}
        searchInput={searchInput}
        onSearch={withPageReset(setSearchInput)}
        summary={data?.meta?.summary}
        noun={copy.noun}
      />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <PaymentTable
        party="customer"
        noun={`customer ${copy.noun}`}
        payments={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search) || period.period !== "all"}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      {creating && <CustomerPaymentFormModal kind={kind} onClose={() => setCreating(false)} onSaved={handleSaved} />}

      <PaymentDetailsModal party="customer" payment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default CustomerPaymentList;
