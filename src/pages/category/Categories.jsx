import { useState } from "react";
import CategoryDeleteModal from "../../components/category/CategoryDeleteModal";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import CategoryHeader from "../../components/category/CategoryHeader";
import CategoryTable from "../../components/category/CategoryTable";
import Alert from "../../components/common/alerts/Alert";
import SearchInput from "../../components/common/forms/SearchInput";
import { useAuth } from "../../hooks/useAuth";
import { useCategoriesData, useDeleteCategory } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { hasPermission } from "../../utils/access";

const Categories = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "category.create");
  const canEdit = hasPermission(user, "category.edit");
  const canDelete = hasPermission(user, "category.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { category: null } = create, { category } = edit
  const [deleting, setDeleting] = useState(null);

  // call category api (search and paging run on the backend)
  const { data, isLoading, error } = useCategoriesData({ search, page, limit });
  const deleteCategory = useDeleteCategory();
  const categories = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (category) => {
    setNotice("");
    setForm({ category });
  };

  const openDelete = (category) => {
    setNotice("");
    setDeleting(category);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteCategory.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (categories.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <CategoryHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search category..." className="max-w-sm pt-2" />

      <Alert type="success">{notice}</Alert>
      <Alert>{error?.message}</Alert>

      <CategoryTable
        categories={categories}
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

      {form && <CategoryFormModal category={form.category} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <CategoryDeleteModal category={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Categories;
