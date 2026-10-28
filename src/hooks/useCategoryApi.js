import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  fetchCategoriesData,
  updateCategory,
} from "../providers/apiProviders/categoryApiProvider";

const CATEGORY_KEY = "categories";

// ✅ One page of categories — params: { search, status, page, limit }
export const useCategoriesData = (params) => {
  return useQuery({
    queryKey: [CATEGORY_KEY, params],
    queryFn: () => fetchCategoriesData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Create / update / delete — each refreshes the category lists
const useCategoryMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORY_KEY] }),
  });
};

export const useCreateCategory = () => useCategoryMutation((data) => createCategory(data));

export const useUpdateCategory = () => useCategoryMutation(({ id, data }) => updateCategory(id, data));

export const useDeleteCategory = () => useCategoryMutation((id) => deleteCategory(id));
