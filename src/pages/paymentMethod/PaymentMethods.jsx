import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import PaymentMethodDeleteModal from "../../components/paymentMethod/PaymentMethodDeleteModal";
import PaymentMethodFormModal from "../../components/paymentMethod/PaymentMethodFormModal";
import PaymentMethodHeader from "../../components/paymentMethod/PaymentMethodHeader";
import PaymentMethodTable from "../../components/paymentMethod/PaymentMethodTable";
import PaymentMethodTransactionModal from "../../components/paymentMethod/PaymentMethodTransactionModal";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeletePaymentMethod, usePaymentMethodsData } from "../../hooks/usePaymentMethodApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";

const PaymentMethods = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "payment_method.create");
  const canEdit = hasPermission(user, "payment_method.edit");
  const canDelete = hasPermission(user, "payment_method.delete");
  const canTransact = hasPermission(user, "payment_method.transaction");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { paymentMethod: null } = create, { paymentMethod } = edit
  const [moving, setMoving] = useState(null); // { paymentMethod, direction: "in" | "out" }
  const [deleting, setDeleting] = useState(null);

  // call payment method api (search and paging run on the backend)
  const { data, isLoading, error } = usePaymentMethodsData({ search, page, limit });
  const deletePaymentMethod = useDeletePaymentMethod();
  const paymentMethods = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (paymentMethod) => {
    setNotice("");
    setForm({ paymentMethod });
  };

  const openTransaction = (paymentMethod, direction) => {
    setNotice("");
    setMoving({ paymentMethod, direction });
  };

  const openDelete = (paymentMethod) => {
    setNotice("");
    setDeleting(paymentMethod);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleMoved = (saved, direction, amount) => {
    setMoving(null);
    setNotice(`${formatTaka(amount)} ${direction === "in" ? "added to" : "taken out of"} "${saved.name}". Balance: ${formatTaka(saved.balance)}.`);
  };

  const handleDelete = async () => {
    await deletePaymentMethod.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (paymentMethods.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <PaymentMethodHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search payment methods..." className="max-w-sm pt-2" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <PaymentMethodTable
        paymentMethods={paymentMethods}
        meta={data?.meta}
        isLoading={isLoading}
        search={search}
        canTransact={canTransact}
        canEdit={canEdit}
        canDelete={canDelete}
        onTransaction={openTransaction}
        onEdit={openForm}
        onDelete={openDelete}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {form && <PaymentMethodFormModal paymentMethod={form.paymentMethod} onClose={() => setForm(null)} onSaved={handleSaved} />}

      {moving && (
        <PaymentMethodTransactionModal
          paymentMethod={moving.paymentMethod}
          direction={moving.direction}
          onClose={() => setMoving(null)}
          onSaved={handleMoved}
        />
      )}

      <PaymentMethodDeleteModal paymentMethod={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default PaymentMethods;
