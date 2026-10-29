import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Textarea from "../../components/common/forms/Textarea";
import PageHeader from "../../components/common/layout/PageHeader";
import PurchaseSummaryBar from "../../components/purchase/PurchaseSummaryBar";
import ReturnItemsTable from "../../components/purchase/ReturnItemsTable";
import StockPicker from "../../components/purchase/StockPicker";
import SupplierPicker from "../../components/purchase/SupplierPicker";
import { ROUTES } from "../../constants/routes";
import { useCreatePurchaseReturn } from "../../hooks/usePurchaseApi";
import { newReturnLine, returnLinesError, returnLinesTotal, toReturnItems } from "../../utils/purchase";

const AddPurchaseReturn = () => {
  // all states
  const [supplier, setSupplier] = useState(null);
  const [lines, setLines] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  // call purchase return api
  const createPurchaseReturn = useCreatePurchaseReturn();

  const total = returnLinesTotal(lines);

  // Picked IMEIs belong to one supplier, so a new supplier clears them
  const selectSupplier = (next) => {
    setSupplier(next);
    setLines((prev) => prev.map((line) => ({ ...line, units: [] })));
  };

  const addLine = (stock) => {
    setError("");
    setLines((prev) => (prev.some((line) => line.stock.product._id === stock.product._id) ? prev : [...prev, newReturnLine(stock)]));
  };

  const changeLine = (index, field, value) => setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));

  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setSaved(null);
    const problem = (!supplier && "Select a supplier.") || returnLinesError(lines);
    if (problem) return setError(problem);

    try {
      const purchaseReturn = await createPurchaseReturn.mutateAsync({
        supplier: supplier._id,
        items: toReturnItems(lines),
        note: note.trim(),
      });
      setSaved(purchaseReturn);
      setSupplier(null);
      setLines([]);
      setNote("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Add Purchase Return" subtitle="Create a purchase return by selecting a supplier and products." />

      {saved && (
        <Alert type="success">
          Return <span className="font-semibold">{saved.returnNo}</span> saved. {saved.supplier?.name}'s balance went down by the return total.{" "}
          <Link to={ROUTES.BRANCH_PURCHASE_RETURNS} className="font-semibold underline">
            View return list
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[2fr_3fr]">
        <SupplierPicker selected={supplier} onSelect={selectSupplier} />
        <StockPicker addedIds={new Set(lines.map((line) => line.stock.product._id))} onAdd={addLine} />
      </div>

      <ReturnItemsTable lines={lines} supplierId={supplier?._id} onChange={changeLine} onRemove={removeLine} />

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note / Remarks</p>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Return Note</h2>
        <Textarea placeholder="Why are these going back?" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </section>

      <Alert>{error}</Alert>

      <PurchaseSummaryBar
        amounts={[{ label: "Return Total", value: total }]}
        submitLabel="Create Purchase Return"
        onSubmit={handleSubmit}
        submitting={createPurchaseReturn.isPending}
        disabled={!supplier || !lines.length}
      />
    </div>
  );
};

export default AddPurchaseReturn;
