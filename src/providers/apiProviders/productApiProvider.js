import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Create / update send multipart/form-data so an image can go with the fields
const toFormData = ({ image, ...fields }) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (image) formData.append("image", image);
  return formData;
};

// ✅ Fetch Function — one page of products
// params: { search, status, category, brand, page, limit } -> { data, meta }
export const fetchProductsData = async (params) => {
  const response = await apiRequest(`/products${toQueryString(params)}`);
  return response;
};

// ✅ Create product — data: { name, category, brand, status, trackSerial, image?: File }
export const createProduct = async (data) => {
  const response = await apiRequest("/products", { method: "POST", body: toFormData(data) });
  return response.data;
};

// ✅ Update product — same fields (all optional), plus removeImage: true to drop the current image
export const updateProduct = async (id, data) => {
  const response = await apiRequest(`/products/${id}`, { method: "PATCH", body: toFormData(data) });
  return response.data;
};

// ✅ Delete product
export const deleteProduct = async (id) => {
  const response = await apiRequest(`/products/${id}`, { method: "DELETE" });
  return response;
};
