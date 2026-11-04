import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Repair jobs work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of jobs
// params: { search, status, technician, overdue, from, to, page, limit } -> { data, meta: { ...paging, summary } }
export const fetchRepairsData = async (params) => apiRequest(`/repairs${toQueryString(params)}`);

// ✅ Fetch Function — one job, with its costs if this user runs repairs
export const fetchRepairData = async (id) => (await apiRequest(`/repairs/${id}`)).data;

// ✅ Fetch Function — { staff }: who can be the technician
export const fetchRepairOptions = async () => (await apiRequest("/repairs/options")).data;

// ✅ Fetch Function — { sale, earlier }: where this branch sold an IMEI, and its earlier repairs
export const fetchRepairDevice = async (imei) => (await apiRequest(`/repairs/device${toQueryString({ imei })}`)).data;

// ✅ Book a device in — data: customer details, device details, payments (advance)
export const createRepair = async (data) => (await apiRequest("/repairs", { method: "POST", body: data })).data;

// ✅ Correct an open job's details
export const updateRepair = async ({ id, data }) => (await apiRequest(`/repairs/${id}`, { method: "PATCH", body: data })).data;

// ✅ Move an open job — data: { status, note }
export const updateRepairStatus = async ({ id, data }) => (await apiRequest(`/repairs/${id}/status`, { method: "POST", body: data })).data;

// ✅ Add a cost — data: { kind, label, amount, paymentMethod }
export const addRepairCost = async ({ id, data }) => (await apiRequest(`/repairs/${id}/costs`, { method: "POST", body: data })).data;

// ✅ Remove a cost
export const removeRepairCost = async ({ id, costId }) => (await apiRequest(`/repairs/${id}/costs/${costId}`, { method: "DELETE" })).data;

// ✅ Add an advance — data: { payments }
export const addRepairPayment = async ({ id, data }) => (await apiRequest(`/repairs/${id}/payments`, { method: "POST", body: data })).data;

// ✅ Deliver or cancel — data: { outcome, charge, payments, refundMethod, warrantyDays, note }
export const closeRepair = async ({ id, data }) => (await apiRequest(`/repairs/${id}/close`, { method: "POST", body: data })).data;
