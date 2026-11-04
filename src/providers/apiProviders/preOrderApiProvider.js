import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Pre orders work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — one page of bookings
// params: { search, status, overdue, from, to, page, limit } -> { data, meta: { ...paging, summary } }
export const fetchPreOrdersData = async (params) => apiRequest(`/pre-orders${toQueryString(params)}`);

// ✅ Fetch Function — one booking, with its stock position and, once sold, its invoice
export const fetchPreOrderData = async (id) => (await apiRequest(`/pre-orders/${id}`)).data;

// ✅ Fetch Function — { staff }: who can be the seller
export const fetchPreOrderOptions = async () => (await apiRequest("/pre-orders/options")).data;

// ✅ Fetch Function — active products this branch has none of: { search, category, brand, page, limit } -> { data, meta }
export const fetchPreOrderProducts = async (params) => apiRequest(`/pre-orders/products${toQueryString(params)}`);

// ✅ Book products — data: { customer, bookedBy, items: [{ product, quantity, unitPrice }], discount, deliveryCharge, expectedDate, note, payments }
export const createPreOrder = async (data) => (await apiRequest("/pre-orders", { method: "POST", body: data })).data;

// ✅ Change what's booked — data: { items, discount, deliveryCharge, expectedDate, note }
export const updatePreOrder = async ({ id, data }) => (await apiRequest(`/pre-orders/${id}`, { method: "PATCH", body: data })).data;

// ✅ Take another advance — data: { payments }
export const addPreOrderPayment = async ({ id, data }) => (await apiRequest(`/pre-orders/${id}/payments`, { method: "POST", body: data })).data;

// ✅ Note that the customer was told it arrived
export const markPreOrderNotified = async ({ id }) => (await apiRequest(`/pre-orders/${id}/notified`, { method: "POST", body: {} })).data;

// ✅ Sell it on an invoice — data: { items: [{ product, serials, unitPrice }], discount, deliveryCharge, payments, refundMethod, soldBy }
export const sellPreOrder = async ({ id, data }) => (await apiRequest(`/pre-orders/${id}/sell`, { method: "POST", body: data })).data;

// ✅ Cancel it, refunding the advance — data: { refundMethod, note }
export const cancelPreOrder = async ({ id, data }) => (await apiRequest(`/pre-orders/${id}/cancel`, { method: "POST", body: data })).data;
