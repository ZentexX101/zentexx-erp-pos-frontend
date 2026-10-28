import { useState } from "react";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import IconButton from "../../components/common/buttons/IconButton";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import Pagination from "../../components/common/data/Pagination";
import SearchInput from "../../components/common/forms/SearchInput";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { CATEGORY_STATUS } from "../../constants/category";
import { useAuth } from "../../hooks/useAuth";
import { useCategoriesData, useDeleteCategory } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { hasPermission } from "../../utils/access";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";

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
  // null = closed, { category: null } = create, { category } = edit
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // call category api (search and paging run on the backend)
  const { data, isLoading, error } = useCategoriesData({ search, page, limit });
  const deleteCategory = useDeleteCategory();
  const categories = data?.data ?? [];
  const meta = data?.meta;

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

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "name", header: "Category Name", className: "font-medium text-slate-900" },
    {
      key: "incentiveAmount",
      header: "Incentive (৳)",
      render: (c) => <Badge tone="outline">৳{c.incentiveAmount}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge tone={c.status === CATEGORY_STATUS.ACTIVE ? "green" : "slate"}>
          {c.status === CATEGORY_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (c) => formatShortDate(c.createdAt) },
  ];

  // Action column only for users who can edit or delete
  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          {canEdit && <IconButton icon="edit" label={`Edit ${c.name}`} onClick={() => openForm(c)} />}
          {canDelete && (
            <IconButton
              icon="trash"
              label={`Delete ${c.name}`}
              variant="danger"
              onClick={() => {
                setNotice("");
                setDeleting(c);
              }}
            />
          )}
        </div>
      ),
    });
  }

  return (
    <div>
      <PageHeader
        title="Category"
        subtitle="Manage all categories"
        actions={
          canCreate && (
            <Button onClick={() => openForm(null)}>
              <Icon name="plus" />
              Create Category
            </Button>
          )
        }
      />

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search category..." className="mt-6 max-w-sm" />

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error?.message}</Alert>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={categories}
          loading={isLoading}
          minWidth={720}
          emptyMessage={search ? `No category matches "${search}".` : "No categories yet. Create your first category."}
        />
        <Pagination meta={meta} onPageChange={setPage} onLimitChange={handleLimitChange} />
      </div>

      {form && <CategoryFormModal category={form.category} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete category"
        confirmLabel="Delete"
        danger
        message={
          <>
            Delete <span className="font-medium text-slate-900">{deleting?.name}</span>? This can't be undone. If you only want to
            stop using it, set it to inactive instead.
          </>
        }
      />
    </div>
  );
};

export default Categories;
