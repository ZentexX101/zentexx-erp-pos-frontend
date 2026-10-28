import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchCategoriesData,
  fetchCategoryOptionsData,
  updateCategory,
} from "../providers/apiProviders/categoryApiProvider";

const CATEGORY_KEY = "categories";

// ✅ One page of categories — params: { search, status, page, limit }
export const useCategoriesData = (params) => {
  return useQuery({
    queryKey: [CATEGORY_KEY, "list", params],
    queryFn: () => fetchCategoriesData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active categories for dropdowns
export const useCategoryOptionsData = () => {
  return useQuery({
    queryKey: [CATEGORY_KEY, "options"],
    queryFn: fetchCategoryOptionsData,
  });
};

// ✅ Create / update / delete — refresh every category query, and products (they show category names)
const useCategoryMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateCategory = () => useCategoryMutation((data) => createCategory(data));

export const useUpdateCategory = () => useCategoryMutation(({ id, data }) => updateCategory(id, data));

export const useDeleteCategory = () => useCategoryMutation((id) => deleteCategory(id));
