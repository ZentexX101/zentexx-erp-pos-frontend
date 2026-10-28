import { useCallback, useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Pagination from "../../components/common/data/Pagination";
import Spinner from "../../components/common/loaders/Spinner";
import Modal from "../../components/common/modals/Modal";
import { BRANCH_STATUS } from "../../constants/branch";
import { ROLE_LABELS, ROLES, USER_STATUS } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useBranchOptionsData } from "../../hooks/useBranchApi";
import { useApproveRegistration, useRegistrationsData, useRejectRegistration } from "../../hooks/useRegistrationApi";
import { formatDate } from "../../utils/formatDate";
import { formatPhone } from "../../utils/phone";

const TABS = [
  { status: USER_STATUS.PENDING, label: "Pending" },
  { status: USER_STATUS.REJECTED, label: "Rejected" },
  { status: USER_STATUS.APPROVED, label: "Approved" },
];

const REASON_MAX = 300;

const SELECT_CLASS = "rounded-md border bg-white px-2 py-2 text-sm text-slate-700";

// Approve as a sub admin (needs a branch) or, owner only, as an admin (all branches).
const ApproveControls = ({ user, branches, canGrantAdmin, busy, onApprove }) => {
  const [role, setRole] = useState(ROLES.SUB_ADMIN);
  const [branchId, setBranchId] = useState("");
  const [branchError, setBranchError] = useState(false);
  const roles = [canGrantAdmin && ROLES.ADMIN, ROLES.SUB_ADMIN].filter(Boolean);
  const branchRequired = role !== ROLES.ADMIN;

  const handleApprove = () => {
    if (branchRequired && !branchId) {
      setBranchError(true);
      return;
    }
    onApprove(user, role, branchId || null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`role-${user._id}`}>
        Role for {user.name}
      </label>
      <select
        id={`role-${user._id}`}
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          setBranchError(false);
        }}
        disabled={busy}
        className={`${SELECT_CLASS} border-slate-300`}
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor={`branch-${user._id}`}>
        Branch for {user.name}
      </label>
      <select
        id={`branch-${user._id}`}
        value={branchId}
        onChange={(e) => {
          setBranchId(e.target.value);
          setBranchError(false);
        }}
        disabled={busy}
        aria-invalid={branchError}
        className={`${SELECT_CLASS} max-w-48 ${branchError ? "border-red-400" : "border-slate-300"}`}
      >
        <option value="">{branchRequired ? "Select branch" : "All branches (main admin)"}</option>
        {branches.map((b) => (
          <option key={b._id} value={b._id}>
            {b.name}
          </option>
        ))}
      </select>

      <Button onClick={handleApprove} loading={busy} className="text-sm">
        Approve
      </Button>
      {branchError && <p className="w-full text-xs text-red-600">Select a branch for this user.</p>}
    </div>
  );
};

const Registrations = () => {
  const { user: currentUser } = useAuth();
  const canGrantAdmin = currentUser.role === ROLES.SUPER_ADMIN;

  // all states
  const [status, setStatus] = useState(USER_STATUS.PENDING);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  // call registration api (paging runs on the backend)
  const { data, isLoading, error: listError } = useRegistrationsData({ status, page, limit });
  // Only active branches can receive new users
  const { data: branches = [], error: branchError } = useBranchOptionsData(BRANCH_STATUS.ACTIVE);
  const approveRegistration = useApproveRegistration();
  const rejectRegistration = useRejectRegistration();

  const users = data?.data ?? [];
  const meta = data?.meta;
  const loadError = (listError || branchError)?.message;

  const changeTab = (next) => {
    setNotice("");
    setStatus(next);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  // An approved / rejected user leaves this tab; step back if they were the page's last row
  const afterReview = () => {
    if (users.length === 1 && page > 1) setPage(page - 1);
  };

  const handleApprove = async (user, role, branchId) => {
    setBusyId(user._id);
    setError("");
    setNotice("");
    try {
      const approved = await approveRegistration.mutateAsync({ userId: user._id, role, branchId });
      afterReview();
      const where = approved.branch ? ` at ${approved.branch.name}` : " (main admin)";
      setNotice(`${user.name} approved as ${ROLE_LABELS[role]}${where}. They can sign in now.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const closeRejectModal = useCallback(() => {
    setRejecting(null);
    setReason("");
  }, []);

  const handleReject = async () => {
    const user = rejecting;
    setBusyId(user._id);
    setError("");
    setNotice("");
    try {
      await rejectRegistration.mutateAsync({ userId: user._id, reason: reason.trim() });
      afterReview();
      setNotice(`${user.name}'s registration was rejected.`);
      closeRejectModal();
    } catch (err) {
      setError(err.message);
      closeRejectModal();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-slate-900">Registration requests</h1>
      <p className="mt-1 text-sm text-slate-500">People who registered themselves. They can sign in only after approval.</p>

      <div className="mt-6 flex gap-1 border-b border-slate-200" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            role="tab"
            aria-selected={status === tab.status}
            onClick={() => changeTab(tab.status)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              status === tab.status
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error || loadError}</Alert>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6 text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            No {status} registrations.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {users.map((user) => (
              <li key={user._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {formatPhone(user.phone)}
                    {user.email && ` · ${user.email}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Registered {formatDate(user.createdAt)}
                    {user.reviewedBy && ` · Reviewed by ${user.reviewedBy.name} on ${formatDate(user.reviewedAt)}`}
                  </p>
                  {user.status === USER_STATUS.REJECTED && user.rejectionReason && (
                    <p className="mt-1 text-sm text-red-600">Reason: {user.rejectionReason}</p>
                  )}
                  {user.status === USER_STATUS.APPROVED && (
                    <span className="mt-2 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {ROLE_LABELS[user.role] || user.role}
                      {user.branch ? ` · ${user.branch.name}` : " · Main admin"}
                    </span>
                  )}
                </div>

                {user.status !== USER_STATUS.APPROVED && (
                  <div className="flex shrink-0 flex-wrap items-start gap-2">
                    <ApproveControls
                      user={user}
                      branches={branches}
                      canGrantAdmin={canGrantAdmin}
                      busy={busyId === user._id}
                      onApprove={handleApprove}
                    />
                    {user.status === USER_STATUS.PENDING && (
                      <Button
                        variant="secondary"
                        onClick={() => setRejecting(user)}
                        disabled={busyId === user._id}
                        className="text-sm"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {!isLoading && <Pagination meta={meta} onPageChange={setPage} onLimitChange={handleLimitChange} />}
      </div>

      <Modal
        isOpen={Boolean(rejecting)}
        onClose={closeRejectModal}
        title="Reject registration"
        footer={
          <>
            <Button variant="secondary" onClick={closeRejectModal} disabled={Boolean(busyId)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={Boolean(busyId)}>
              Reject
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Reject <span className="font-medium text-slate-900">{rejecting?.name}</span> ({rejecting?.email})? They'll see
          the reason when they try to sign in.
        </p>
        <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium text-slate-700">
          Reason (optional)
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          maxLength={REASON_MAX}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {reason.length}/{REASON_MAX}
        </p>
      </Modal>
    </div>
  );
};

export default Registrations;
