import { useState } from "react";
import ServiceDeleteModal from "../../components/service/ServiceDeleteModal";
import ServiceFormModal from "../../components/service/ServiceFormModal";
import ServiceHeader from "../../components/service/ServiceHeader";
import ServiceTable from "../../components/service/ServiceTable";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import { useAuth } from "../../hooks/useAuth";
import { useServicesData, useDeleteService } from "../../hooks/useServiceApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { hasPermission } from "../../utils/access";

const Services = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "service.create");
  const canEdit = hasPermission(user, "service.edit");
  const canDelete = hasPermission(user, "service.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { service: null } = create, { service } = edit
  const [deleting, setDeleting] = useState(null);

  // call service api (search and paging run on the backend)
  const { data, isLoading, error } = useServicesData({ search, page, limit });
  const deleteService = useDeleteService();
  const services = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (service) => {
    setNotice("");
    setForm({ service });
  };

  const openDelete = (service) => {
    setNotice("");
    setDeleting(service);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteService.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (services.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <ServiceHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search service..." className="max-w-sm pt-2" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <ServiceTable
        services={services}
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

      {form && <ServiceFormModal service={form.service} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <ServiceDeleteModal service={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Services;
