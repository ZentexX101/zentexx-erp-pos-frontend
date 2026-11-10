import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, deleteProduct, fetchProductsData, updateProduct } from "../providers/apiProviders/productApiProvider";

const PRODUCT_KEY = "products";

// ✅ One page of products — params: { search, status, category, brand, page, limit }
export const useProductsData = (params) => {
  return useQuery({
    queryKey: [PRODUCT_KEY, "list", params],
    queryFn: () => fetchProductsData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Create / update / delete — each refreshes the product lists
const useProductMutation = (mutationFn, success) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] }),
  });
};

export const useCreateProduct = () => useProductMutation((data) => createProduct(data), (saved) => `"${saved?.name ?? "Product"}" created.`);

export const useUpdateProduct = () => useProductMutation(({ id, data }) => updateProduct(id, data), (saved) => `"${saved?.name ?? "Product"}" updated.`);

export const useDeleteProduct = () => useProductMutation((id) => deleteProduct(id), "Product deleted.");
