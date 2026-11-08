// Must match the backend (src/modules/product/product.constants.js and middlewares/uploadImage.js)
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// The usual values for each variant attribute; anything else can be typed in
export const VARIANT_CHOICES = {
  color: { label: "Color", options: ["Black", "White", "Blue", "Green", "Purple", "Gold", "Silver", "Red", "Titanium"], placeholder: "Other color" },
  ram: { label: "RAM", options: ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"], placeholder: "Other RAM" },
  storage: { label: "Storage (ROM)", options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"], placeholder: "Other" },
  region: {
    label: "Region / Version",
    hint: "where the set is from",
    options: ["Official", "Global", "CN", "IN", "US", "UK", "JP", "KR", "UAE", "HK"],
    placeholder: "Other",
  },
};

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
