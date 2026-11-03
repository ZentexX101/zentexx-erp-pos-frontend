import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import FilterBar from "../../components/common/forms/FilterBar";
import PeriodFilter from "../../components/common/forms/PeriodFilter";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import TransferDetailsModal from "../../components/transfer/TransferDetailsModal";
import TransferFormModal from "../../components/transfer/TransferFormModal";
import TransferTable from "../../components/transfer/TransferTable";
import { isMainAdmin } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useBranchNamesData } from "../../hooks/useBranchApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useTransfersData } from "../../hooks/useTransferApi";
import { hasPermission } from "../../utils/access";
import { periodRange } from "../../utils/period";

const DIRECTION_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "received", label: "Received" },
];

// Transfers. scope "main": every branch, any sender. scope "branch": this branch's sent and
// received transfers, sent from this branch only.
const Transfers = ({ scope = "main" }) => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const inBranch = scope === "branch";

  // all states
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [branchFilter, setBranchFilter] = useState("");
  const [direction, setDirection] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);

  // call transfer api (period, filters and paging run on the backend)
  const branch = inBranch ? activeBranch?._id : branchFilter;
  const { data, isLoading, error } = useTransfersData({
    search,
    branch,
    direction: branch ? direction : "",
    ...periodRange(period.period, period),
    page,
    limit,
  });
  const { data: branches = [] } = useBranchNamesData();
  const summary = data?.meta?.summary;

  // Any filter change starts again from page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleSaved = (transfer) => {
    setCreating(false);
    setNotice(`${transfer.transferNo}: ${transfer.totalQuantity} pcs moved from ${transfer.fromBranch?.name} to ${transfer.toBranch?.name}.`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transfer"
        subtitle={inBranch ? `Stock sent from and received by ${activeBranch?.name ?? "this branch"}` : "Stock moved between branches"}
        actions={
          hasPermission(user, "transfer.create") && (
            <Button
              onClick={() => {
                setNotice("");
                setCreating(true);
              }}
            >
              <Icon name="plus" />
              Create Transfer
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterBar search={<SearchInput value={searchInput} onChange={withPageReset(setSearchInput)} placeholder="Transfer no., product or IMEI..." />}>
          <PeriodFilter value={period} onChange={withPageReset(setPeriod)} />
          {!inBranch && (
            <Select
              variant="filter"
              aria-label="Branch"
              placeholder="All branches"
              options={branches.map((b) => ({ value: b._id, label: b.name }))}
              value={branchFilter}
              onChange={(e) => withPageReset(setBranchFilter)(e.target.value)}
            />
          )}
          {branch && (
            <Select
              variant="filter"
              aria-label="Direction"
              placeholder="Sent & received"
              options={DIRECTION_OPTIONS}
              value={direction}
              onChange={(e) => withPageReset(setDirection)(e.target.value)}
            />
          )}
        </FilterBar>
        {summary && (
          <p className="text-sm text-slate-600">
            {summary.count} transfer{summary.count === 1 ? "" : "s"} · <span className="font-bold text-slate-900">{summary.units} pcs</span>
          </p>
        )}
      </div>

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <TransferTable
        transfers={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={Boolean(search || branchFilter || direction) || period.period !== "all"}
        ownBranch={branch}
        onView={setViewing}
        onPageChange={setPage}
        onLimitChange={withPageReset(setLimit)}
      />

      <TransferDetailsModal transfer={viewing} showCost={isMainAdmin(user)} onClose={() => setViewing(null)} />

      {creating && <TransferFormModal fixedFrom={inBranch ? activeBranch : null} onClose={() => setCreating(false)} onSaved={handleSaved} />}
    </div>
  );
};

export default Transfers;
