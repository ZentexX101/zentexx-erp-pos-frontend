import ExportPdfButton from "../../components/common/export/ExportPdfButton";
import { pdfReports } from "../../constants/pdfReports";
import { useState } from "react";
import { LuAlarmClock, LuChevronRight, LuClipboardList, LuPackageCheck, LuPhone, LuWallet } from "react-icons/lu";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import Pagination from "../../components/common/data/Pagination";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import HrStat from "../../components/hr/HrStat";
import { PRE_ORDER_STATUS, PRE_ORDER_TABS } from "../../constants/preOrder";
import { preOrderDetailPath, ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePreOrdersData } from "../../hooks/usePreOrderApi";
import { hasPermission } from "../../utils/access";
import { formatDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";
import { preOrderTitle } from "../../utils/preOrder";
import { formatPhone } from "../../utils/phone";

const LATE_OPTIONS = [{ value: "true", label: "Only late" }];

const isLate = (row) => row.status === "booked" && row.expectedDate && new Date(row.expectedDate) < new Date();

// Every booking: what's waiting, what can be sold now, and what's done
const PreOrders = () => {
  const { user } = useAuth();

  // all states
  const [tab, setTab] = useState("booked");
  const [period, setPeriod] = useState({ period: "all", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [overdue, setOverdue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // call pre order api (filters and paging run on the backend)
  const { data, isLoading, error } = usePreOrdersData({ search, status: tab, overdue, ...periodRange(period.period, period), page, limit });
  const s = data?.meta?.summary;
  const countOf = (key) =>
    key === "ready" ? (s?.ready ?? 0) : key === "" ? Object.values(s?.counts ?? {}).reduce((total, n) => total + n, 0) : (s?.counts?.[key] ?? 0);

  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "no",
      header: "Booking",
      render: (r) => (
        <Link to={preOrderDetailPath(r._id)} className="block hover:opacity-75">
          <span className="block font-mono text-xs font-semibold text-slate-900">{r.preOrderNo}</span>
          <span className="block whitespace-nowrap text-xs text-slate-500">{formatDate(r.bookedAt)}</span>
        </Link>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <>
          <span className="block max-w-64 truncate font-medium text-slate-900" title={r.items.map((item) => item.name).join(", ")}>
            {preOrderTitle(r)}
          </span>
        </>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (
        <>
          <span className="block max-w-44 truncate font-medium text-slate-900">{r.customerName}</span>
          <a href={`tel:${r.customerPhone}`} className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-slate-500 hover:text-slate-900">
            <LuPhone className="size-3" aria-hidden="true" />
            {formatPhone(r.customerPhone)}
          </a>
        </>
      ),
    },
    {
      key: "expected",
      header: "Expected",
      className: "whitespace-nowrap",
      render: (r) =>
        r.expectedDate ? (
          <span className={isLate(r) ? "font-semibold text-red-600" : "text-slate-600"}>
            {formatDate(r.expectedDate)}
            {isLate(r) && <span className="block text-xs font-medium">Late</span>}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: "money",
      header: "Total / advance",
      headerClassName: "text-right",
      className: "whitespace-nowrap text-right",
      render: (r) => (
        <>
          <span className="block font-semibold text-slate-900">{formatTaka(r.total)}</span>
          <span className="block text-xs font-medium text-emerald-700">Advance {formatTaka(r.paidAmount)}</span>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (r) =>
        r.ready ? (
          <Badge dot tone="amber">
            Stock arrived
          </Badge>
        ) : (
          <Badge dot tone={PRE_ORDER_STATUS[r.status].tone}>
            {PRE_ORDER_STATUS[r.status].label}
          </Badge>
        ),
    },
    {
      key: "open",
      header: "",
      className: "text-right",
      render: (r) => (
        <Link
          to={preOrderDetailPath(r._id)}
          aria-label={`Open ${r.preOrderNo}`}
          className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <LuChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        tools={<ExportPdfButton report={pdfReports.preOrders()} params={{ search, status: tab, overdue }} />}
        title="Pre Orders"
        subtitle="Products booked before they arrive, and who's next when stock comes in"
        actions={
          hasPermission(user, "pre_order.create") && (
            <Link
              to={ROUTES.BRANCH_PRE_ORDER_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              New Pre Order
            </Link>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <HrStat label="Booked" value={s?.counts?.booked ?? 0} icon={LuClipboardList} accent="blue" hint="Still waiting" />
        <HrStat label="Stock arrived" value={s?.ready ?? 0} icon={LuPackageCheck} accent="amber" hint="Oldest first" />
        <HrStat
          label="Late"
          value={s?.overdue ?? 0}
          tone={s?.overdue ? "text-red-600" : "text-slate-900"}
          icon={LuAlarmClock}
          accent="red"
          hint="Past the date"
        />
        <div className="col-span-2 xl:col-span-1">
          <HrStat label="Advance held" value={formatTaka(s?.advanceHeld ?? 0)} icon={LuWallet} accent="green" hint="Customers' money, not income" />
        </div>
      </div>

      <div
        className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] sm:w-fit"
        role="tablist"
        aria-label="Booking status"
      >
        {PRE_ORDER_TABS.map((item) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => withPageReset(setTab)(item.key)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${tab === item.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {item.label}
            <span className="text-xs tabular-nums text-slate-400">{countOf(item.key)}</span>
          </button>
        ))}
      </div>

      <FilterBar
        search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Booking no., invoice, product, customer or phone..." />}
      >
        <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
        <Select
          variant="filter"
          aria-label="Late"
          placeholder="Any date"
          options={LATE_OPTIONS}
          value={overdue}
          onChange={(e) => withPageReset(setOverdue)(e.target.value)}
        />
      </FilterBar>

      <Alert>{error?.message}</Alert>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        minWidth={980}
        emptyMessage={
          search || overdue || period.period !== "all"
            ? "No booking found for these filters."
            : tab === "booked"
              ? "Nothing booked right now."
              : "No booking here yet."
        }
      />
      <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={withPageReset(setLimit)} />
    </div>
  );
};

export default PreOrders;
