// Must match the backend (src/modules/product/product.constants.js and middlewares/uploadImage.js)
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
