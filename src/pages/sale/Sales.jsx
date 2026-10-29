import { useCallback, useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import SaleDetailsModal from "../../components/sale/SaleDetailsModal";
import SaleInvoicePrint from "../../components/sale/SaleInvoicePrint";
import SaleTable from "../../components/sale/SaleTable";
import { ROUTES } from "../../constants/routes";
import { isMainAdmin } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { useSalesData } from "../../hooks/useSaleApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";

const DUE_OPTIONS = [{ value: "true", label: "Only with due" }];

// The period's totals; profit only for main admins
const Totals = ({ summary, showProfit }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
    {[
      { label: "Sales", value: summary?.count ?? 0, plain: true },
      { label: "Total", value: summary?.total, className: "text-slate-900" },
      { label: "Paid", value: summary?.paid, className: "text-green-600" },
      { label: "Due", value: summary?.due, className: "text-red-600" },
      ...(showProfit ? [{ label: "Profit", value: summary?.profit, className: "text-indigo-600" }] : []),
    ].map(({ label, value, plain, className }) => (
      <div key={label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-lg font-bold ${className ?? "text-slate-900"}`}>{plain ? value : formatTaka(value ?? 0)}</p>
      </div>
    ))}
  </div>
);

// POS Orders List: this branch's sales
const Sales = () => {
  const { user } = useAuth();

  // all states
  const [period, setPeriod] = useState({ period: "today", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [due, setDue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState(null);
  const [printSale, setPrintSale] = useState(null);

  // call sale api (period, search, due and paging run on the backend)
  const { data, isLoading, error } = useSalesData({ search, due, ...periodRange(period.period, period), page, limit });
  usePrintWhenReady(printSale, useCallback(() => setPrintSale(null), []));

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <div className="space-y-4 print:hidden">
        <PageHeader
          title="POS Orders List"
          subtitle="Every sale of this branch"
          actions={
            hasPermission(user, "sales.create") && (
              <Link
                to={ROUTES.BRANCH_POS}
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
              >
                <Icon name="plus" />
                Create POS
              </Link>
            )
          }
        />

        <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Invoice, customer, phone or IMEI..." />}>
          <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
          <Select
            variant="filter"
            aria-label="Due filter"
            placeholder="All sales"
            options={DUE_OPTIONS}
            value={due}
            onChange={(e) => withPageReset(setDue)(e.target.value)}
          />
        </FilterBar>

        <Totals summary={data?.meta?.summary} showProfit={isMainAdmin(user)} />

        <Alert>{error?.message}</Alert>

        <SaleTable
          sales={data?.data ?? []}
          meta={data?.meta}
          isLoading={isLoading}
          hasFilters={Boolean(search || due) || period.period !== "all"}
          onView={setViewing}
          onPageChange={setPage}
          onLimitChange={withPageReset(setLimit)}
        />

        <SaleDetailsModal sale={viewing} canSeeProfit={isMainAdmin(user)} onPrint={setPrintSale} onClose={() => setViewing(null)} />
      </div>

      {printSale && <SaleInvoicePrint sale={printSale} />}
    </div>
  );
};

export default Sales;
