import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of services
// params: { search, status, page, limit } -> { data, meta }
export const fetchServicesData = async (params) => {
  const response = await apiRequest(`/services${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — active services for the POS dropdown (name, pricePercent, incentivePercent)
export const fetchServiceOptionsData = async () => {
  const response = await apiRequest("/services/options");
  return response.data;
};

// ✅ Create service
export const createService = async (data) => {
  const response = await apiRequest("/services", { method: "POST", body: data });
  return response.data;
};

// ✅ Update service
export const updateService = async (id, data) => {
  const response = await apiRequest(`/services/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete service
export const deleteService = async (id) => {
  const response = await apiRequest(`/services/${id}`, { method: "DELETE" });
  return response;
};
