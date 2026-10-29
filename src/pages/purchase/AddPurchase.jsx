import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import ProductPicker from "../../components/purchase/ProductPicker";
import PurchaseItemList from "../../components/purchase/PurchaseItemList";
import PurchasePaymentCard from "../../components/purchase/PurchasePaymentCard";
import PurchaseSummaryBar from "../../components/purchase/PurchaseSummaryBar";
import SupplierPicker from "../../components/purchase/SupplierPicker";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useCreatePurchase } from "../../hooks/usePurchaseApi";
import { hasPermission } from "../../utils/access";
import { roundTaka } from "../../utils/number";
import { linesTotal, newPurchaseLine, purchaseLinesError, toPurchaseItems } from "../../utils/purchase";

const NO_PAYMENT = { paidAmount: "", paymentMethod: "", note: "" };

const AddPurchase = () => {
  const { user } = useAuth();

  // all states
  const [supplier, setSupplier] = useState(null);
  const [lines, setLines] = useState([]);
  const [payment, setPayment] = useState(NO_PAYMENT);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null); // the last created purchase, for the success message

  // call purchase api
  const createPurchase = useCreatePurchase();

  const total = linesTotal(lines);
  const paid = Number(payment.paidAmount) || 0;
  const due = roundTaka(total - paid);

  const addLine = (product) => {
    setError("");
    setLines((prev) => (prev.some((line) => line.product._id === product._id) ? prev : [...prev, newPurchaseLine(product)]));
  };

  const changeLine = (index, field, value) => setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));

  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const changePayment = (field, value) => {
    setError("");
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaved(null);
    const problem =
      (!supplier && "Select a supplier.") ||
      purchaseLinesError(lines) ||
      (paid > total && "Paid amount can't be more than the total.") ||
      (paid > 0 && !payment.paymentMethod && "Select the payment method you paid from.");
    if (problem) return setError(problem);

    try {
      const purchase = await createPurchase.mutateAsync({
        supplier: supplier._id,
        items: toPurchaseItems(lines),
        paidAmount: paid,
        paymentMethod: paid > 0 ? payment.paymentMethod : "",
        note: payment.note.trim(),
      });
      // Ready for the next invoice
      setSaved(purchase);
      setSupplier(null);
      setLines([]);
      setPayment(NO_PAYMENT);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Add Purchase" subtitle="Create a purchase by selecting a supplier and products." />

      {saved && (
        <Alert type="success">
          Purchase <span className="font-semibold">{saved.invoiceNo}</span> saved for {saved.supplier?.name}.{" "}
          <Link to={ROUTES.BRANCH_PURCHASES} className="font-semibold underline">
            View purchase list
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[2fr_3fr]">
        <SupplierPicker selected={supplier} onSelect={setSupplier} canCreate={hasPermission(user, "supplier.create")} />
        <ProductPicker
          addedIds={new Set(lines.map((line) => line.product._id))}
          onAdd={addLine}
          canCreate={hasPermission(user, "product.create")}
        />
      </div>

      <PurchaseItemList lines={lines} onChange={changeLine} onRemove={removeLine} />

      <PurchasePaymentCard total={total} payment={payment} onChange={changePayment} />

      <Alert>{error}</Alert>

      <PurchaseSummaryBar
        amounts={[
          { label: "Total Amount", value: total },
          { label: "Paid", value: paid, className: "text-green-600" },
          { label: "Due (supplier)", value: due, className: due > 0 ? "text-red-600" : "text-slate-900" },
        ]}
        submitLabel="Create Purchase"
        onSubmit={handleSubmit}
        submitting={createPurchase.isPending}
        disabled={!supplier || !lines.length}
      />
    </div>
  );
};

export default AddPurchase;
