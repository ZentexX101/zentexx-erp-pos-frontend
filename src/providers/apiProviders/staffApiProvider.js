import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of staff
// params: { search, role, branch, status, page, limit } -> { data, meta }; branch "none" = main admins
export const fetchStaffData = async (params) => {
  const response = await apiRequest(`/staff${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — permission catalog for the staff form
// { modules: [{ key, label, group, actions }], actionLabels: { view: "View", ... } }
export const fetchPermissionCatalogData = async () => {
  const response = await apiRequest("/staff/permissions");
  return response.data;
};

// ✅ Create staff
export const createStaff = async (data) => {
  const response = await apiRequest("/staff", { method: "POST", body: data });
  return response.data;
};

// ✅ Update staff (partial; send password only to change it)
export const updateStaff = async (id, data) => {
  const response = await apiRequest(`/staff/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete staff
export const deleteStaff = async (id) => {
  const response = await apiRequest(`/staff/${id}`, { method: "DELETE" });
  return response;
};
