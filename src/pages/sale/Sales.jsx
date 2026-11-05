import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
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

// What differs between the POS Orders List and the Exchange Orders List
const KINDS = {
  sale: {
    title: "POS Orders List",
    subtitle: "Every sale of this branch",
    createLabel: "Create POS",
    createPath: ROUTES.BRANCH_POS,
    permission: "sales.create",
  },
  exchange: {
    title: "Exchange Orders List",
    subtitle: "Every exchange of this branch: new items sold, old devices taken in",
    createLabel: "Create Exchange",
    createPath: ROUTES.BRANCH_EXCHANGE_NEW,
    permission: "return.create",
  },
};

// The period's totals; profit only for main admins, exchange value only on exchanges
const Totals = ({ summary, showProfit, showExchange }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
    {[
      { label: "Sales", value: summary?.count ?? 0, plain: true },
      { label: "Total", value: summary?.total, className: "text-slate-900" },
      { label: "Paid", value: summary?.paid, className: "text-green-600" },
      { label: "Due", value: summary?.due, className: "text-red-600" },
      ...(showExchange ? [{ label: "Old devices taken", value: summary?.exchange, className: "text-purple-600" }] : []),
      ...(showProfit ? [{ label: "Profit", value: summary?.profit, className: "text-indigo-600" }] : []),
    ].map(({ label, value, plain, className }) => (
      <div key={label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-lg font-bold ${className ?? "text-slate-900"}`}>{plain ? value : formatTaka(value ?? 0)}</p>
      </div>
    ))}
  </div>
);

// POS Orders List (kind "sale") or Exchange Orders List (kind "exchange") of this branch
const Sales = ({ kind = "sale" }) => {
  const copy = KINDS[kind];
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
  const { data, isLoading, error } = useSalesData({ search, due, ...periodRange(period.period, period), page, limit }, kind);
  usePrintWhenReady(
    printSale,
    useCallback(() => setPrintSale(null), []),
  );

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <div className="space-y-4 print:hidden">
        <PageHeader
          tools={<ExportPdfButton report={pdfReports.sales(kind, isMainAdmin(user))} params={{ search, due }} />}
          title={copy.title}
          subtitle={copy.subtitle}
          actions={
            hasPermission(user, copy.permission) && (
              <Link to={copy.createPath} className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover">
                <Icon name="plus" />
                {copy.createLabel}
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

        <Totals summary={data?.meta?.summary} showProfit={isMainAdmin(user)} showExchange={kind === "exchange"} />

        <Alert>{error?.message}</Alert>

        <SaleTable
          sales={data?.data ?? []}
          showExchange={kind === "exchange"}
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
