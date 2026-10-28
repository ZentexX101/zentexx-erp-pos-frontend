import { useState } from "react";
import BrandDeleteModal from "../../components/brand/BrandDeleteModal";
import BrandFormModal from "../../components/brand/BrandFormModal";
import BrandHeader from "../../components/brand/BrandHeader";
import BrandTable from "../../components/brand/BrandTable";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import { useAuth } from "../../hooks/useAuth";
import { useBrandsData, useDeleteBrand } from "../../hooks/useBrandApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { hasPermission } from "../../utils/access";

const Brands = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "brand.create");
  const canEdit = hasPermission(user, "brand.edit");
  const canDelete = hasPermission(user, "brand.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { brand: null } = create, { brand } = edit
  const [deleting, setDeleting] = useState(null);

  // call brand api (search and paging run on the backend)
  const { data, isLoading, error } = useBrandsData({ search, page, limit });
  const deleteBrand = useDeleteBrand();
  const brands = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (brand) => {
    setNotice("");
    setForm({ brand });
  };

  const openDelete = (brand) => {
    setNotice("");
    setDeleting(brand);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteBrand.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (brands.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <BrandHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search brand..." className="max-w-sm pt-2" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <BrandTable
        brands={brands}
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

      {form && <BrandFormModal brand={form.brand} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <BrandDeleteModal brand={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Brands;
