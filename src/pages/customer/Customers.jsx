import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import CustomerBalanceNote from "../../components/customer/CustomerBalanceNote";
import CustomerDeleteModal from "../../components/customer/CustomerDeleteModal";
import CustomerFormModal from "../../components/customer/CustomerFormModal";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerTable from "../../components/customer/CustomerTable";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeleteCustomer, useCustomersData } from "../../hooks/useCustomerApi";
import { hasPermission } from "../../utils/access";

const Customers = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "customer.create");
  const canEdit = hasPermission(user, "customer.edit");
  const canDelete = hasPermission(user, "customer.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { customer: null } = create, { customer } = edit
  const [deleting, setDeleting] = useState(null);

  // call customer api (search and paging run on the backend)
  const { data, isLoading, error } = useCustomersData({ search, page, limit });
  const deleteCustomer = useDeleteCustomer();
  const customers = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (customer) => {
    setNotice("");
    setForm({ customer });
  };

  const openDelete = (customer) => {
    setNotice("");
    setDeleting(customer);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteCustomer.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (customers.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <CustomerHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <CustomerBalanceNote />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search name, phone, address..." className="max-w-sm" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <CustomerTable
        customers={customers}
        meta={data?.meta}
        isLoading={isLoading}
        search={search}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={openForm}
        onDelete={openDelete}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {form && <CustomerFormModal customer={form.customer} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <CustomerDeleteModal customer={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Customers;
