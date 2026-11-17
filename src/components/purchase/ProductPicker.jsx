import { useState } from "react";
import { LuCheck, LuPlus, LuRefreshCw } from "react-icons/lu";
import { PRODUCT_STATUS } from "../../constants/product";
import { useBrandOptionsData } from "../../hooks/useBrandApi";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useProductsData } from "../../hooks/useProductApi";
import Button from "../common/buttons/Button";
import Badge from "../common/data/Badge";
import Pagination from "../common/data/Pagination";
import SearchInput from "../common/forms/SearchInput";
import Icon from "../common/icons/Icon";
import Spinner from "../common/loaders/Spinner";
import ProductFormModal from "../product/ProductFormModal";
import PickerCard from "./PickerCard";
import ProductThumb from "./ProductThumb";

// Active products, searched and paged on the backend. Clicking a row adds it to the purchase;
// addedIds marks the ones already added. canCreate adds an "Add Product" button.
const ProductPicker = ({ addedIds, onAdd, canCreate = false, step }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isFetching, refetch } = useProductsData({ search, status: PRODUCT_STATUS.ACTIVE, page, limit });
  const { data: categories = [] } = useCategoryOptionsData();
  const { data: brands = [] } = useBrandOptionsData();
  const products = data?.data ?? [];

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleCreated = (product) => {
    setCreating(false);
    if (product.status === PRODUCT_STATUS.ACTIVE) onAdd(product);
  };

  return (
    <PickerCard
      step={step}
      eyebrow="Product Selection"
      title="Select Products"
      actions={
        <>
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <LuRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => setCreating(true)}>
              <Icon name="plus" />
              Add Product
            </Button>
          )}
        </>
      }
    >
      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search product by name" />

      <div className="mt-3 h-80 shrink-0 overflow-y-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-5 w-5 text-indigo-600" />
          </div>
        ) : products.length === 0 ? (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">{search ? `No product matches "${search}".` : "No active products yet."}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.map((product) => {
              const added = addedIds.has(product._id);
              return (
                <li key={product._id}>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    disabled={added}
                    className="group flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 disabled:cursor-default disabled:bg-emerald-50/50"
                  >
                    <ProductThumb product={product} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium uppercase text-slate-900">{product.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {[product.category?.name, product.brand?.name].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {product.trackSerial && <Badge tone="purple">IMEI</Badge>}
                    {added ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <LuCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Added
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                        <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Pagination
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />

      {creating && (
        <ProductFormModal product={null} categories={categories} brands={brands} onClose={() => setCreating(false)} onSaved={handleCreated} />
      )}
    </PickerCard>
  );
};

export default ProductPicker;
