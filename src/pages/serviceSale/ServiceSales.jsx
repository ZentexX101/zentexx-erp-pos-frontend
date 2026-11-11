import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
import { useState } from "react";
import { LuConciergeBell } from "react-icons/lu";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ServiceSaleTable from "../../components/serviceSale/ServiceSaleTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useServiceOptionsData } from "../../hooks/useServiceApi";
import { useServiceSalesData } from "../../hooks/useServiceSaleApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";

const DUE_OPTIONS = [{ value: "true", label: "Only with due" }];

// The period's totals
const Totals = ({ summary }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 max-sm:[&>*:last-child:nth-child(odd)]:col-span-2">
    {[
      { label: "Services sold", value: summary?.count ?? 0, plain: true },
      { label: "Total", value: summary?.total, className: "text-slate-900" },
      { label: "Paid", value: summary?.paid, className: "text-green-600" },
      { label: "Due", value: summary?.due, className: "text-red-600" },
      { label: "Staff incentive", value: summary?.incentive, className: "text-amber-700" },
    ].map(({ label, value, plain, className }) => (
      <div key={label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`text-lg font-bold ${className ?? "text-slate-900"}`}>{plain ? value : formatTaka(value ?? 0)}</p>
      </div>
    ))}
  </div>
);

// Nothing to list: say what this page is for and how to sell the first service
const EmptyState = ({ filtered, canSell }) => (
  <div className="mx-auto max-w-md py-4">
    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
      <LuConciergeBell className="size-5" aria-hidden="true" />
    </span>
    <p className="mt-3 text-base font-semibold text-slate-900">{filtered ? "No service sale matches" : "No service sold in this period"}</p>
    <p className="mt-1 text-sm leading-relaxed text-slate-500">
      {filtered
        ? "Try another search or service, or a longer period."
        : "A service sale adds coverage or a warranty to a phone this branch already sold. Its price is a % of the phone's selling price."}
    </p>
    {!filtered && canSell && (
      <Link
        to={ROUTES.BRANCH_SERVICE_SALE_NEW}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
      >
        <Icon name="plus" />
        Sell a service
      </Link>
    )}
  </div>
);

// Service Sales of this branch: every service sold for a device, with search, period, service and due filters
const ServiceSales = () => {
  const { user } = useAuth();

  // all states
  const [period, setPeriod] = useState({ period: "all", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [service, setService] = useState("");
  const [due, setDue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // call service sale api (filters and paging run on the backend)
  const { data, isLoading, error } = useServiceSalesData({ search, service, due, ...periodRange(period.period, period), page, limit });
  const { data: services = [] } = useServiceOptionsData();

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        tools={<ExportPdfButton report={pdfReports.serviceSales()} params={{ search, service, due }} />}
        title="Service Sales"
        subtitle="Coverage, warranty and other services sold for phones this branch already sold"
        actions={
          hasPermission(user, "sales.create") && (
            <Link
              to={ROUTES.BRANCH_SERVICE_SALE_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              Sell Service
            </Link>
          )
        }
      />

      <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="No., invoice, IMEI, customer or phone..." />}>
        <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
        <Select
          variant="filter"
          aria-label="Service"
          placeholder="All services"
          options={services.map((s) => ({ value: s._id, label: s.name }))}
          value={service}
          onChange={(e) => withPageReset(setService)(e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Due filter"
          placeholder="All"
          options={DUE_OPTIONS}
          value={due}
          onChange={(e) => withPageReset(setDue)(e.target.value)}
        />
      </FilterBar>

      <Totals summary={data?.meta?.summary} />

      <Alert>{error?.message}</Alert>

      <ServiceSaleTable
        rows={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        emptyState={<EmptyState filtered={Boolean(search || service || due)} canSell={hasPermission(user, "sales.create")} />}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />
    </div>
  );
};

export default ServiceSales;
