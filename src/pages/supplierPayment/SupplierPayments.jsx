import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import PaymentDetailsModal from "../../components/payment/PaymentDetailsModal";
import PaymentListFilters from "../../components/payment/PaymentListFilters";
import SupplierPaymentFormModal from "../../components/supplierPayment/SupplierPaymentFormModal";
import PaymentTable from "../../components/payment/PaymentTable";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSupplierPaymentsData } from "../../hooks/useSupplierPaymentApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";

// Branch panel: this branch's supplier payments
const SupplierPayments = () => {
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

  // call supplier payment api (period, search and paging run on the backend)
  const { data, isLoading, error } = useSupplierPaymentsData({ search, ...periodRange(period.period, period), page, limit });

  const handlePeriod = (value) => {
    setPeriod(value);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const handleSaved = (saved) => {
    setCreating(false);
    setNotice(`${saved.paymentNo}: ${formatTaka(saved.totalAmount)} paid to ${saved.supplier?.name}.`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Supplier Payment"
        subtitle="Manage all supplier payments"
        actions={
          canCreate && (
            <Button
              onClick={() => {
                setNotice("");
                setCreating(true);
              }}
            >
              <Icon name="plus" />
              Create Supplier Payment
            </Button>
          )
        }
      />

      <PaymentListFilters
        searchPlaceholder="Search payment no. or supplier..."
        period={period}
        onPeriod={handlePeriod}
        searchInput={searchInput}
        onSearch={handleSearch}
        summary={data?.meta?.summary}
      />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <PaymentTable
        party="supplier"
        noun="supplier payment"
        payments={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search) || period.period !== "all"}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {creating && <SupplierPaymentFormModal onClose={() => setCreating(false)} onSaved={handleSaved} />}

      <PaymentDetailsModal party="supplier" payment={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default SupplierPayments;
