import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import ProductDeleteModal from "../../components/product/ProductDeleteModal";
import ProductFilters from "../../components/product/ProductFilters";
import ProductFormModal from "../../components/product/ProductFormModal";
import ProductHeader from "../../components/product/ProductHeader";
import ProductTable from "../../components/product/ProductTable";
import { useAuth } from "../../hooks/useAuth";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeleteProduct, useProductsData } from "../../hooks/useProductApi";
import { hasPermission } from "../../utils/access";

const NO_FILTERS = { category: "", brand: "", status: "" };

const Products = () => {
  const { user } = useAuth();
  const canCreate = hasPermission(user, "product.create");
  const canEdit = hasPermission(user, "product.edit");
  const canDelete = hasPermission(user, "product.delete");

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null); // null = closed, { product: null } = create, { product } = edit
  const [deleting, setDeleting] = useState(null);

  // call product api (search, filters and paging run on the backend)
  const { data, isLoading, error: productError } = useProductsData({ ...filters, search, page, limit });
  // Active categories / brands for the filters and the form
  const { data: categories = [], error: categoryError } = useCategoryOptionsData();
  const { data: brands = [], error: brandError } = useBrandOptionsData();
  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];
  const error = (productError || categoryError || brandError)?.message;
  const hasFilters = Boolean(search || filters.category || filters.brand || filters.status);

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (product) => {
    setNotice("");
    setForm({ product });
  };

  const openDelete = (product) => {
    setNotice("");
    setDeleting(product);
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (products.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4">
      <ProductHeader canCreate={canCreate} onCreate={() => openForm(null)} />

      <ProductFilters
        searchInput={searchInput}
        onSearch={handleSearch}
        filters={filters}
        onFilter={handleFilter}
        onClear={handleClearFilters}
        categories={categories}
        brands={brands}
      />

      <Alert type="success">{notice}</Alert>
      <Alert>{error}</Alert>

      <ProductTable
        products={products}
        meta={data?.meta}
        isLoading={isLoading}
        hasFilters={hasFilters}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={openForm}
        onDelete={openDelete}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      {form && (
        <ProductFormModal
          product={form.product}
          categories={categories}
          brands={brands}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      <ProductDeleteModal product={deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default Products;
