import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
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
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import HrStat from "../../components/hr/HrStat";
import { REPLACEMENT_STATUS, REPLACEMENT_STATUS_OPTIONS } from "../../constants/replacement";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useReplacementsData, useResolveReplacement } from "../../hooks/useReplacementApi";
import { hasPermission } from "../../utils/access";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import { periodRange } from "../../utils/period";

const ACTIONS = {
  restocked: {
    title: "Put it back in stock?",
    message: "It's fixed or the supplier swapped it. It can be sold again, and its cost comes back to the profit.",
    confirmLabel: "Back to stock",
  },
  written_off: {
    title: "Write it off?",
    message: "It can't be saved. It stays out of stock for good, and this can't be undone.",
    confirmLabel: "Write off",
    danger: true,
  },
};

// Every replacement, and what became of each faulty piece
const Replacements = () => {
  const { user } = useAuth();
  const canManage = hasPermission(user, "return.create");

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deciding, setDeciding] = useState(null); // { row, status }
  const [error, setError] = useState("");

  // call replacement api (filters and paging run on the backend)
  const { data, isLoading, error: loadError } = useReplacementsData({ search, status, ...periodRange(period.period, period), page, limit });
  const resolve = useResolveReplacement();
  const s = data?.meta?.summary;

  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const decide = async () => {
    setError("");
    try {
      await resolve.mutateAsync({ id: deciding.row._id, status: deciding.status });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeciding(null);
    }
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(data?.meta, i) },
    {
      key: "no",
      header: "No.",
      render: (r) => (
        <>
          <span className="block font-mono text-xs font-semibold text-slate-900">{r.replacementNo}</span>
          <span className="block whitespace-nowrap text-xs text-slate-500">{formatDateTime(r.date)}</span>
        </>
      ),
    },
    {
      key: "piece",
      header: "Piece",
      render: (r) => (
        <>
          <span className="block max-w-64 truncate font-medium uppercase text-slate-900" title={r.productName}>
            {r.productName}
          </span>
          <span className="flex flex-wrap items-center gap-1 font-mono text-xs text-slate-500">
            {r.oldSerial ? (
              <>
                {r.oldSerial}
                <LuArrowRight className="size-3" aria-hidden="true" />
                {r.newSerial}
              </>
            ) : (
              `${r.quantity} pcs`
            )}
            <span className="font-sans">· {r.invoiceNo}</span>
          </span>
          <span className="block max-w-72 truncate text-xs text-slate-500" title={r.reason}>
            {r.reason}
          </span>
        </>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (r.customer ? <span className="font-medium text-slate-900">{r.customer.name}</span> : <span className="text-slate-400">Walk-in</span>),
    },
    {
      key: "cost",
      header: "Cost",
      headerClassName: "text-right",
      className: "whitespace-nowrap text-right font-semibold text-slate-900",
      render: (r) => formatTaka(r.newCost),
    },
    {
      key: "charge",
      header: "Charged",
      headerClassName: "text-right",
      className: "whitespace-nowrap text-right text-green-600",
      render: (r) => (r.charge ? formatTaka(r.charge) : <span className="text-slate-300">—</span>),
    },
    {
      key: "status",
      header: "Faulty piece",
      className: "whitespace-nowrap",
      render: (r) => <Badge tone={REPLACEMENT_STATUS[r.status].tone}>{REPLACEMENT_STATUS[r.status].label}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "whitespace-nowrap text-right",
      render: (r) =>
        canManage && r.status === "damaged" ? (
          <span className="inline-flex gap-1.5">
            <button
              type="button"
              onClick={() => setDeciding({ row: r, status: "restocked" })}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back to stock
            </button>
            <button
              type="button"
              onClick={() => setDeciding({ row: r, status: "written_off" })}
              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Write off
            </button>
          </span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Replacement List"
        subtitle="Faulty pieces swapped for new ones, and what became of them"
        actions={
          canManage && (
            <Link
              to={ROUTES.BRANCH_REPLACEMENT_NEW}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover"
            >
              <Icon name="plus" />
              Create Replacement
            </Link>
          )
        }
      />

      <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="No., invoice, IMEI, customer or phone..." />}>
        <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
        <Select
          variant="filter"
          aria-label="Faulty piece"
          placeholder="Any faulty piece"
          options={REPLACEMENT_STATUS_OPTIONS}
          value={status}
          onChange={(e) => withPageReset(setStatus)(e.target.value)}
        />
      </FilterBar>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HrStat label="Replacements" value={s?.count ?? 0} hint={`${s?.pieces ?? 0} pcs`} />
        <HrStat label="New pieces cost" value={formatTaka(s?.cost ?? 0)} />
        <HrStat label="Charged" value={formatTaka(s?.charge ?? 0)} tone="text-green-600" />
        <HrStat label="Still damaged" value={s?.damaged ?? 0} tone={s?.damaged ? "text-amber-600" : "text-slate-900"} hint="Waiting for a decision" />
      </div>

      <Alert>{error || loadError?.message}</Alert>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        minWidth={1000}
        emptyMessage={search || status || period.period !== "all" ? "No replacement found for these filters." : "No replacement yet."}
      />
      <Pagination meta={data?.meta} onPageChange={setPage} onLimitChange={withPageReset(setLimit)} />

      <ConfirmModal
        isOpen={Boolean(deciding)}
        onClose={() => setDeciding(null)}
        onConfirm={decide}
        {...(deciding ? ACTIONS[deciding.status] : { title: "", message: "" })}
      />
    </div>
  );
};

export default Replacements;
