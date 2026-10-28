import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBrand,
  deleteBrand,
  fetchBrandOptionsData,
  fetchBrandsData,
  updateBrand,
} from "../providers/apiProviders/brandApiProvider";

const BRAND_KEY = "brands";

// ✅ One page of brands — params: { search, status, page, limit }
export const useBrandsData = (params) => {
  return useQuery({
    queryKey: [BRAND_KEY, "list", params],
    queryFn: () => fetchBrandsData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active brands for dropdowns
export const useBrandOptionsData = () => {
  return useQuery({
    queryKey: [BRAND_KEY, "options"],
    queryFn: fetchBrandOptionsData,
  });
};

// ✅ Create / update / delete — refresh every brand query, and products (they show brand names)
const useBrandMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRAND_KEY] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateBrand = () => useBrandMutation((data) => createBrand(data));

export const useUpdateBrand = () => useBrandMutation(({ id, data }) => updateBrand(id, data));

export const useDeleteBrand = () => useBrandMutation((id) => deleteBrand(id));
