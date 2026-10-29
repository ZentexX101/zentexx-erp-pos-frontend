import { useId, useState } from "react";
import { useUpdateStockPrices } from "../../hooks/useStockApi";
import { toDecimalInput } from "../../utils/number";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Badge from "../common/data/Badge";
import FormSection from "../common/forms/FormSection";
import Input from "../common/forms/Input";
import Modal from "../common/modals/Modal";

// "Update Stock": the selling price, and the buying price for main admins only (canEditCost)
const StockPriceModal = ({ stock, canEditCost, onClose, onSaved }) => {
  const formId = useId();
  const [salePrice, setSalePrice] = useState(String(stock.salePrice));
  const [purchasePrice, setPurchasePrice] = useState(String(stock.purchasePrice));
  const [error, setError] = useState("");
  const updatePrices = useUpdateStockPrices();
  const { product } = stock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (salePrice === "" || (canEditCost && purchasePrice === "")) return setError("Enter both prices.");

    const data = { salePrice: Number(salePrice) };
    if (canEditCost) data.purchasePrice = Number(purchasePrice);

    try {
      const saved = await updatePrices.mutateAsync({ id: stock._id, data });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Update Stock"
      subtitle={product.name}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={updatePrices.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={updatePrices.isPending} className="min-w-32">
            Update
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{error}</Alert>

        <div className="flex flex-wrap gap-2">
          <Badge tone="outline">Category: {product.category?.name ?? "—"}</Badge>
          <Badge tone="outline">Brand: {product.brand?.name ?? "—"}</Badge>
          <Badge tone="outline">Available Qty: {stock.quantity}</Badge>
        </div>

        <FormSection title="Update Product Price (Selling & Buying)" icon="settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product Selling Price (৳)"
              required
              autoFocus
              inputMode="decimal"
              value={salePrice}
              onChange={(e) => setSalePrice(toDecimalInput(e.target.value))}
            />
            <div>
              <Input
                label="Product Buying Price (৳)"
                required={canEditCost}
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(toDecimalInput(e.target.value))}
                disabled={!canEditCost}
                labelAside={<Badge tone="blue">Main Admin only</Badge>}
                inputClassName={canEditCost ? "" : "bg-slate-50 text-slate-500"}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            The selling price applies to every piece in stock{product.trackSerial ? " (all IMEIs)" : ""}. Purchases already made keep their own
            prices.
          </p>
        </FormSection>
      </form>
    </Modal>
  );
};

export default StockPriceModal;
