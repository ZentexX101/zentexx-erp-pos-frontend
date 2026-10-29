import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  deleteService,
  fetchServiceOptionsData,
  fetchServicesData,
  updateService,
} from "../providers/apiProviders/serviceApiProvider";

const SERVICE_KEY = "services";

// ✅ One page of services — params: { search, status, page, limit }
export const useServicesData = (params) => {
  return useQuery({
    queryKey: [SERVICE_KEY, "list", params],
    queryFn: () => fetchServicesData(params),
    placeholderData: keepPreviousData, // keep the current page on screen while the next one loads
  });
};

// ✅ Active services for dropdowns
export const useServiceOptionsData = () => {
  return useQuery({
    queryKey: [SERVICE_KEY, "options"],
    queryFn: fetchServiceOptionsData,
  });
};

// ✅ Create / update / delete — refresh every service query (lists and options)
const useServiceMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICE_KEY] }),
  });
};

export const useCreateService = () => useServiceMutation((data) => createService(data));

export const useUpdateService = () => useServiceMutation(({ id, data }) => updateService(id, data));

export const useDeleteService = () => useServiceMutation((id) => deleteService(id));
