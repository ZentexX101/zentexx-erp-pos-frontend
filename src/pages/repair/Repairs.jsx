import { useState } from "react";
import { LuAlarmClock, LuChevronRight, LuHandCoins, LuPackageCheck, LuPhone, LuWrench } from "react-icons/lu";
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
import { OPEN_STATUSES, REPAIR_STATUS, REPAIR_TABS } from "../../constants/repair";
import { repairDetailPath, ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useRepairOptions, useRepairsData } from "../../hooks/useRepairApi";
import { hasPermission } from "../../utils/access";
import { formatDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { periodRange } from "../../utils/period";
import { formatPhone } from "../../utils/phone";

const OVERDUE_OPTIONS = [{ value: "true", label: "Only overdue" }];

const isOverdue = (job) => OPEN_STATUSES.includes(job.status) && job.promisedDate && new Date(job.promisedDate) < new Date();

// Every device in for repair: what's in the shop first, with its promise date, and everything done before
const Repairs = () => {
  const { user } = useAuth();

  // all states
  const [tab, setTab] = useState("open");
  const [period, setPeriod] = useState({ period: "all", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [technician, setTechnician] = useState("");
  const [overdue, setOverdue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // call repair api (filters and paging run on the backend)
  const { data, isLoading, error } = useRepairsData({ search, status: tab, technician, overdue, ...periodRange(period.period, period), page, limit });
  const { data: options } = useRepairOptions();
  const s = data?.meta?.summary;
  const countOf = (key) =>
    key === "open" ? (s?.open ?? 0) : key === "" ? Object.values(s?.steps ?? {}).reduce((total, n) => total + n, 0) : (s?.steps?.[key] ?? 0);

  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const columns = [
    {
      key: "job",
      header: "Job",
      render: (r) => (
        <Link to={repairDetailPath(r._id)} className="block hover:opacity-75">
          <span className="block font-mono text-xs font-semibold text-slate-900">{r.repairNo}</span>
          <span className="block whitespace-nowrap text-xs text-slate-500">{formatDate(r.receivedAt)}</span>
        </Link>
      ),
    },
    {
      key: "device",
      header: "Device",
      render: (r) => (
        <>
          <span className="block max-w-64 truncate font-medium text-slate-900" title={r.deviceName}>
            {r.deviceName}
          </span>
          {r.imei && <span className="block font-mono text-xs text-slate-500">{r.imei}</span>}
          <span className="block max-w-64 truncate text-xs text-slate-500" title={r.problem}>
            {r.problem}
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
      key: "technician",
      header: "Technician",
      className: "whitespace-nowrap text-slate-600",
      render: (r) =>
        r.technicianType === "outside" ? `${r.outsideName || "Outside"} (outside)` : (r.technician?.name ?? <span className="text-slate-400">Not set</span>),
    },
    {
      key: "promise",
      header: "Promised",
      className: "whitespace-nowrap",
      render: (r) =>
        r.promisedDate ? (
          <span className={isOverdue(r) ? "font-semibold text-red-600" : "text-slate-600"}>
            {formatDate(r.promisedDate)}
            {isOverdue(r) && <span className="block text-xs font-medium">Overdue</span>}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: "money",
      header: "Money",
      headerClassName: "text-right",
      className: "whitespace-nowrap text-right",
      render: (r) =>
        r.closedAt ? (
          <>
            <span className="block font-semibold text-slate-900">{formatTaka(r.charge)}</span>
            {r.dueAmount > 0 && <span className="block text-xs font-medium text-red-600">Due {formatTaka(r.dueAmount)}</span>}
          </>
        ) : (
          <>
            <span className="block text-slate-600">{r.estimate ? `Est. ${formatTaka(r.estimate)}` : "No estimate"}</span>
            {r.paidAmount > 0 && <span className="block text-xs font-medium text-emerald-700">Advance {formatTaka(r.paidAmount)}</span>}
          </>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (r) => (
        <Badge dot tone={REPAIR_STATUS[r.status].tone}>
          {REPAIR_STATUS[r.status].label}
        </Badge>
      ),
    },
    {
      key: "open",
      header: "",
      className: "text-right",
      render: (r) => (
        <Link
          to={repairDetailPath(r._id)}
          aria-label={`Open ${r.repairNo}`}
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
        title="Repairs"
        subtitle="Every device in the shop, who's on it and when it was promised"
        actions={
          hasPermission(user, "repair.create") && (
            <Link
              to={ROUTES.BRANCH_REPAIR_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              New Repair
            </Link>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <HrStat label="In the shop" value={s?.open ?? 0} icon={LuWrench} accent="blue" hint={`${s?.steps?.repairing ?? 0} being repaired`} />
        <HrStat label="Ready" value={s?.steps?.ready ?? 0} icon={LuPackageCheck} accent="amber" hint="Call to collect" />
        <HrStat
          label="Overdue"
          value={s?.overdue ?? 0}
          tone={s?.overdue ? "text-red-600" : "text-slate-900"}
          icon={LuAlarmClock}
          accent="red"
          hint="Past promise"
        />
        <div className="col-span-2 xl:col-span-1">
          <HrStat
            label="Charged"
            value={formatTaka(s?.charged ?? 0)}
            icon={LuHandCoins}
            accent="green"
            hint={
              [s?.profit !== undefined && `Profit ${formatTaka(s.profit)}`, s?.due > 0 && `Due ${formatTaka(s.due)}`].filter(Boolean).join(" · ") ||
              "On closed jobs"
            }
          />
        </div>
      </div>

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] sm:w-fit" role="tablist" aria-label="Job status">
        {REPAIR_TABS.map((item) => (
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
        search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Job no., IMEI, device, customer or phone..." />}
      >
        <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
        <Select
          variant="filter"
          aria-label="Technician"
          placeholder="All technicians"
          options={(options?.staff ?? []).map((member) => ({ value: member._id, label: member.name }))}
          value={technician}
          onChange={(e) => withPageReset(setTechnician)(e.target.value)}
        />
        <Select
          variant="filter"
          aria-label="Overdue"
          placeholder="Any date"
          options={OVERDUE_OPTIONS}
          value={overdue}
          onChange={(e) => withPageReset(setOverdue)(e.target.value)}
        />
      </FilterBar>

      <Alert>{error?.message}</Alert>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        minWidth={1040}
        emptyMessage={
          search || technician || overdue || period.period !== "all"
            ? "No job found for these filters."
            : tab === "open"
              ? "Nothing in the shop right now."
              : "No job here yet."
        }
      />
      <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={withPageReset(setLimit)} />
    </div>
  );
};

export default Repairs;
