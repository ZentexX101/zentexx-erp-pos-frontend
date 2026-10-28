import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrand, deleteBrand, fetchBrandsData, updateBrand } from "../providers/apiProviders/brandApiProvider";

const BRAND_KEY = "brands";

// ✅ One page of brands — params: { search, status, page, limit }
export const useBrandsData = (params) => {
  return useQuery({
    queryKey: [BRAND_KEY, params],
    queryFn: () => fetchBrandsData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Create / update / delete — each refreshes the brand lists
const useBrandMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRAND_KEY] }),
  });
};

export const useCreateBrand = () => useBrandMutation((data) => createBrand(data));

export const useUpdateBrand = () => useBrandMutation(({ id, data }) => updateBrand(id, data));

export const useDeleteBrand = () => useBrandMutation((id) => deleteBrand(id));
