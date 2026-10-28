import { useId, useState } from "react";
import { PRODUCT_STATUS } from "../../constants/product";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProductApi";
import { isValid } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import FormSection from "../common/forms/FormSection";
import ImageUpload from "../common/forms/ImageUpload";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Modal from "../common/modals/Modal";

const STATUS_OPTIONS = [
  { value: PRODUCT_STATUS.ACTIVE, label: "Active" },
  { value: PRODUCT_STATUS.INACTIVE, label: "Inactive" },
];

const toForm = (product) => ({
  name: product?.name || "",
  category: product?.category?._id || "",
  brand: product?.brand?._id || "",
  status: product?.status || PRODUCT_STATUS.ACTIVE,
});

const validate = (form) => ({
  name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
  category: form.category ? "" : "Select a category",
  brand: form.brand ? "" : "Select a brand",
});

// Dropdown options from the active list; an edited product keeps its current one even if it's inactive now
const toOptions = (items, current) => {
  const options = items.map((item) => ({ value: item._id, label: item.name }));
  if (current && !items.some((item) => item._id === current._id)) {
    options.push({ value: current._id, label: `${current.name} (inactive)` });
  }
  return options;
};

// product: the product to edit, or null to create one. categories / brands: active options for the dropdowns.
const ProductFormModal = ({ product, categories, brands, onClose, onSaved }) => {
  const isEdit = Boolean(product);
  const formId = useId();
  const [form, setForm] = useState(() => toForm(product));
  const [image, setImage] = useState(null); // newly picked File
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const submitting = createProduct.isPending || updateProduct.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (file) => {
    setImage(file);
    setRemoveImage(false);
  };

  const handleImageRemove = () => {
    setImage(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validate(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const payload = { ...form, name: form.name.trim(), image };
    // Tell the backend to drop the saved image only when there was one and no new image replaces it
    if (isEdit && removeImage && product.image && !image) payload.removeImage = true;

    try {
      const saved = isEdit
        ? await updateProduct.mutateAsync({ id: product._id, data: payload })
        : await createProduct.mutateAsync(payload);
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setServerError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Update Product" : "Create New Product"}
      subtitle={isEdit ? product.name : "Add a product to the catalog"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} className="min-w-36">
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{serverError}</Alert>

        <FormSection title="Basic Information" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product Name"
              name="name"
              required
              autoFocus
              placeholder="Enter product name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Select
              label="Category"
              name="category"
              required
              placeholder="Select a category"
              options={toOptions(categories, product?.category)}
              value={form.category}
              onChange={handleChange}
              error={errors.category}
            />
            <Select
              label="Brand"
              name="brand"
              required
              placeholder="Select a brand"
              options={toOptions(brands, product?.brand)}
              value={form.brand}
              onChange={handleChange}
              error={errors.brand}
            />
            <Select label="Product Status" name="status" required options={STATUS_OPTIONS} value={form.status} onChange={handleChange} />
          </div>
        </FormSection>

        <FormSection title="Product Images" icon="settings">
          <ImageUpload
            label="Main Product Image"
            file={image}
            existingUrl={removeImage ? null : product?.image?.url}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
            error={errors.image}
          />
        </FormSection>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
