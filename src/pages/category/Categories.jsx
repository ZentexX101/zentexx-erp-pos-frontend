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
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePagedList } from "../../hooks/usePagedList";
import { categoryService } from "../../services/categoryService";
import { hasPermission } from "../../utils/access";
import { formatShortDate } from "../../utils/formatDate";

const Categories = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "category.create");
  const canEdit = hasPermission(user, "category.edit");
  const canDelete = hasPermission(user, "category.delete");

  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());

  // Search and paging run on the backend
  const { rows: categories, meta, setPage, setLimit, loading, error, reload, rowNumber } = usePagedList(categoryService.getCategories, {
    search,
  });

  // null = closed, { category: null } = create, { category } = edit
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openForm = (category) => {
    setNotice("");
    setForm({ category });
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
    reload();
  };

  const handleDelete = async () => {
    await categoryService.remove(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    reload();
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(i) },
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

      <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search category..." className="mt-6 max-w-sm" />

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={categories}
          loading={loading}
          minWidth={720}
          emptyMessage={search ? `No category matches "${search}".` : "No categories yet. Create your first category."}
        />
        {!loading && <Pagination meta={meta} onPageChange={setPage} onLimitChange={setLimit} />}
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
