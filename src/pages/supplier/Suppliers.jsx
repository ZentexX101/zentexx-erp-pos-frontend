import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import SupplierBalanceNote from "../../components/supplier/SupplierBalanceNote";
import SupplierDeleteModal from "../../components/supplier/SupplierDeleteModal";
import SupplierFormModal from "../../components/supplier/SupplierFormModal";
import SupplierHeader from "../../components/supplier/SupplierHeader";
import SupplierTable from "../../components/supplier/SupplierTable";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeleteSupplier, useSuppliersData } from "../../hooks/useSupplierApi";
import { hasPermission } from "../../utils/access";

const Suppliers = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "supplier.create");
  const canEdit = hasPermission(user, "supplier.edit");
  const canDelete = hasPermission(user, "supplier.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { supplier: null } = create, { supplier } = edit
  const [deleting, setDeleting] = useState(null);

  // call supplier api (search and paging run on the backend)
  const { data, isLoading, error } = useSuppliersData({ search, page, limit });
  const deleteSupplier = useDeleteSupplier();
  const suppliers = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (supplier) => {
    setNotice("");
    setForm({ supplier });
  };

  const openDelete = (supplier) => {
    setNotice("");
    setDeleting(supplier);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteSupplier.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (suppliers.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <SupplierHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <SupplierBalanceNote />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search name, phone, address..." className="max-w-sm" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <SupplierTable
        suppliers={suppliers}
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

      {form && <SupplierFormModal supplier={form.supplier} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <SupplierDeleteModal supplier={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Suppliers;
