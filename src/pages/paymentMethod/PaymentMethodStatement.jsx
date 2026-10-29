import { useState } from "react";
import { useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Spinner from "../../components/common/loaders/Spinner";
import PaymentMethodFlowTable from "../../components/paymentMethod/PaymentMethodFlowTable";
import PaymentMethodStatementHeader from "../../components/paymentMethod/PaymentMethodStatementHeader";
import PaymentMethodStatementSummary from "../../components/paymentMethod/PaymentMethodStatementSummary";
import { useBranch } from "../../hooks/useBranch";
import { usePaymentMethodStatementData } from "../../hooks/usePaymentMethodApi";
import { formatShortDate, todayInputValue } from "../../utils/formatDate";

// The last 30 days, like the reference app
const defaultFilters = () => {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: formatShortDate(from), to: todayInputValue() };
};

const PaymentMethodStatement = () => {
  const { id } = useParams();
  const { activeBranch } = useBranch();

  // all states
  const [filters, setFilters] = useState(defaultFilters);

  // call statement api (the period is filtered on the backend)
  const { data: statement, isLoading, error } = usePaymentMethodStatementData(id, filters);

  const handleFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  // "Download PDF": the browser's print dialog -> Save as PDF (layout chrome is hidden when printing)
  const handlePrint = () => window.print();

  return (
    <div className="space-y-4 print:space-y-3 print:text-slate-800">
      <PaymentMethodStatementHeader
        name={statement?.paymentMethod.name}
        branchName={activeBranch?.name}
        filters={filters}
        onFilter={handleFilter}
        onPrint={handlePrint}
        canPrint={Boolean(statement)}
      />

      <Alert>{error?.message}</Alert>

      {isLoading && !statement && (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-indigo-600" />
        </div>
      )}

      {statement && (
        <>
          <PaymentMethodStatementSummary paymentMethod={statement.paymentMethod} summary={statement.summary} />

          {statement.summary.truncated && (
            <Alert type="info">
              This period has {statement.summary.entryCount} transactions; only the first 1000 are listed. Totals include all of them.
              Pick a shorter period to see the rest.
            </Alert>
          )}

          <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-3">
            <PaymentMethodFlowTable
              title="Inflow (Deposits / Collections)"
              direction="in"
              lines={statement.inflows}
              total={statement.summary.totalIn}
              emptyMessage="No inflow transactions found for this period."
            />
            <PaymentMethodFlowTable
              title="Outflow (Withdrawals / Payments)"
              direction="out"
              lines={statement.outflows}
              total={statement.summary.totalOut}
              emptyMessage="No outflow transactions found for this period."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethodStatement;
