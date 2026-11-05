import { useState } from "react";
import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { addToCart, cartError, preOrderTitle, toCartItems } from "../../utils/preOrder";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import PaymentMethodLines from "../payment/PaymentMethodLines";
import PreOrderCart from "./PreOrderCart";
import ProductPicker from "./ProductPicker";

// Runs the page's save, showing any refusal inside the modal
const useSubmit = (onSubmit) => {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const run = async (data) => {
    setError("");
    setSaving(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return { error, setError, saving, run };
};

const Footer = ({ formId, label, saving, onClose, danger }) => (
  <div className="flex justify-end gap-2">
    <Button variant="secondary" onClick={onClose}>
      Back
    </Button>
    <Button type="submit" form={formId} loading={saving} variant={danger ? "danger" : "primary"}>
      {label}
    </Button>
  </div>
);

const SummaryRow = ({ label, value, tone = "text-slate-900", strong }) => (
  <p className={`flex items-center justify-between gap-3 text-sm ${strong ? "font-semibold" : ""}`}>
    <span className="text-slate-600">{label}</span>
    <span className={`font-semibold tabular-nums ${tone}`}>{value}</span>
  </p>
);

const methodOptions = (methods) => methods.map((m) => ({ value: m._id, label: m.name }));

// Another advance from the customer
export const PreOrderAdvanceModal = ({ methods, onClose, onSubmit }) => {
  const [lines, setLines] = useState(() => [newPaymentLine()]);
  const { error, setError, saving, run } = useSubmit(onSubmit);

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = paymentLinesError(lines);
    if (problem) return setError(problem);
    run({ payments: toPaymentItems(lines) });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Take an advance"
      footer={<Footer formId="pre-advance" label="Save advance" saving={saving} onClose={onClose} />}
    >
      <form id="pre-advance" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <PaymentMethodLines lines={lines} onChange={setLines} methods={methods} title="Advance" addLabel="Add" totalLabel="Advance" tone="text-green-600" />
      </form>
    </Modal>
  );
};

// Changes what's booked
export const PreOrderEditModal = ({ row, onClose, onSubmit }) => {
  const [lines, setLines] = useState(() =>
    row.items.map((item) => ({ product: { _id: item.product, name: item.name }, quantity: String(item.quantity), unitPrice: String(item.unitPrice) })),
  );
  const [form, setForm] = useState({
    discount: row.discount ? String(row.discount) : "",
    deliveryCharge: row.deliveryCharge ? String(row.deliveryCharge) : "",
    expectedDate: row.expectedDate ? new Date(row.expectedDate).toLocaleDateString("en-CA") : "",
    note: row.note ?? "",
  });
  const { error, setError, saving, run } = useSubmit(onSubmit);
  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = cartError(lines);
    if (problem) return setError(problem);
    run({
      items: toCartItems(lines),
      discount: Number(form.discount) || 0,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      expectedDate: form.expectedDate,
      note: form.note.trim(),
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={`Edit ${row.preOrderNo}`}
      footer={<Footer formId="pre-edit" label="Save changes" saving={saving} onClose={onClose} />}
    >
      <form id="pre-edit" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        <PreOrderCart lines={lines} onChange={setLines} />
        <ProductPicker value={null} onChange={(product) => product && setLines((prev) => addToCart(prev, product))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Discount" inputMode="decimal" placeholder="0" value={form.discount} onChange={(e) => set("discount", toDecimalInput(e.target.value))} />
          <Input
            label="Delivery charge"
            inputMode="decimal"
            placeholder="0"
            value={form.deliveryCharge}
            onChange={(e) => set("deliveryCharge", toDecimalInput(e.target.value))}
          />
          <Input label="Expected by" type="date" value={form.expectedDate} onChange={(e) => set("expectedDate", e.target.value)} />
          <Input label="Order note" maxLength={500} value={form.note} onChange={(e) => set("note", e.target.value)} />
        </div>
      </form>
    </Modal>
  );
};

// Cancels the booking; the whole advance goes back
export const PreOrderCancelModal = ({ row, methods, onClose, onSubmit }) => {
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const [refundMethod, setRefundMethod] = useState(defaultMethod?._id ?? "");
  const [note, setNote] = useState("");
  const { error, setError, saving, run } = useSubmit(onSubmit);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (row.paidAmount > 0 && !refundMethod) return setError("Pick the account to refund from.");
    run({ refundMethod: row.paidAmount > 0 ? refundMethod : "", note: note.trim() });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Cancel this pre order"
      subtitle={`${row.preOrderNo} · ${preOrderTitle(row)} · ${row.customerName}`}
      footer={<Footer formId="pre-cancel" label="Cancel pre order" saving={saving} onClose={onClose} danger />}
    >
      <form id="pre-cancel" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>
        {row.paidAmount > 0 ? (
          <Select
            label={`Refund ${formatTaka(row.paidAmount)} from`}
            required
            options={methodOptions(methods)}
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
          />
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">No advance was taken, so no money moves.</p>
        )}
        <Textarea label="Why was it cancelled? (optional)" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </form>
    </Modal>
  );
};

// One booked product at the sale: its price, and its IMEIs if it has them
const SellLine = ({ item, price, serials, onPrice, onSerials }) => {
  const { data: pieces = [], isLoading } = useStockSerialsData(item.product, "", { enabled: item.trackSerial });
  const toggle = (serial) =>
    onSerials(serials.includes(serial) ? serials.filter((s) => s !== serial) : serials.length < item.quantity ? [...serials, serial] : serials);

  return (
    <div className="space-y-3 rounded-xl bg-slate-50 p-3.5">
      <div className="flex items-end justify-between gap-3">
        <p className="min-w-0 pb-2 text-sm font-medium uppercase text-slate-900 [overflow-wrap:anywhere]">
          {item.quantity} × {item.name}
        </p>
        <div className="w-32 shrink-0">
          <Input label="Price (each)" inputMode="decimal" value={price} onChange={(e) => onPrice(toDecimalInput(e.target.value))} />
        </div>
      </div>
      {item.trackSerial && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-600">
            Pick {item.quantity} IMEI{item.quantity === 1 ? "" : "s"} ({serials.length} picked)
          </p>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : pieces.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">None of this is in this branch's stock right now.</p>
          ) : (
            <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto p-0.5">
              {pieces.map((piece) => (
                <button
                  key={piece.serial}
                  type="button"
                  aria-pressed={serials.includes(piece.serial)}
                  onClick={() => toggle(piece.serial)}
                  className={`max-w-full rounded-full px-3 py-1.5 font-mono text-xs font-medium ring-1 transition [overflow-wrap:anywhere] ${serials.includes(piece.serial) ? "bg-white text-slate-900 ring-slate-500" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"}`}
                >
                  {piece.serial}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sells the whole booking on an invoice: picks the pieces, then settles what's left after the advance
export const PreOrderSellModal = ({ row, methods, staff, onClose, onSubmit }) => {
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const [prices, setPrices] = useState(() => Object.fromEntries(row.items.map((item) => [item.product, String(item.unitPrice)])));
  const [serials, setSerials] = useState({});
  const [discount, setDiscount] = useState(row.discount ? String(row.discount) : "");
  const [deliveryCharge, setDeliveryCharge] = useState(row.deliveryCharge ? String(row.deliveryCharge) : "");
  const [soldBy, setSoldBy] = useState(row.bookedBy?._id ?? "");
  const [refundMethod, setRefundMethod] = useState(defaultMethod?._id ?? "");
  // null = follow what's left to pay on the default method; a list once edited
  const [editedLines, setEditedLines] = useState(null);
  const { error, setError, saving, run } = useSubmit(onSubmit);

  const subTotal = roundTaka(row.items.reduce((sum, item) => sum + item.quantity * (Number(prices[item.product]) || 0), 0));
  const total = roundTaka(subTotal - (Number(discount) || 0) + (Number(deliveryCharge) || 0));
  const toPay = Math.max(roundTaka(total - row.paidAmount), 0);
  const refund = Math.max(roundTaka(row.paidAmount - total), 0);
  const lines = editedLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: toPay ? String(toPay) : "" }];
  const paidNow = toPay > 0 ? paymentLinesTotal(lines) : 0;
  const due = roundTaka(toPay - paidNow);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filled = toPay > 0 ? lines.filter((line) => line.paymentMethod || Number(line.amount) > 0) : [];
    const short = row.items.find((item) => item.trackSerial && (serials[item.product] ?? []).length !== item.quantity);
    const problem =
      (short && `Pick ${short.quantity} IMEI${short.quantity === 1 ? "" : "s"} for "${short.name}".`) ||
      ((Number(discount) || 0) > subTotal && "Discount can't be more than the sub total.") ||
      (filled.length > 0 && paymentLinesError(filled)) ||
      (paidNow > toPay && `Only ${formatTaka(toPay)} is left to pay.`) ||
      (due > 0 && !row.customer && "A walk-in customer must pay in full.") ||
      (refund > 0 && !refundMethod && "Pick the account to refund from.");
    if (problem) return setError(problem);
    run({
      items: row.items.map((item) => ({ product: item.product, serials: serials[item.product] ?? [], unitPrice: Number(prices[item.product]) || 0 })),
      discount: Number(discount) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      payments: toPaymentItems(filled.filter((line) => Number(line.amount) > 0)),
      refundMethod: refund > 0 ? refundMethod : "",
      soldBy,
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title="Sell this pre order"
      subtitle={`${row.preOrderNo} · ${row.customerName}`}
      footer={<Footer formId="pre-sell" label="Sell and make invoice" saving={saving} onClose={onClose} />}
    >
      <form id="pre-sell" onSubmit={handleSubmit} className="space-y-4">
        <Alert>{error}</Alert>

        {row.items.map((item) => (
          <SellLine
            key={item.product}
            item={item}
            price={prices[item.product]}
            serials={serials[item.product] ?? []}
            onPrice={(value) => setPrices((prev) => ({ ...prev, [item.product]: value }))}
            onSerials={(value) => setSerials((prev) => ({ ...prev, [item.product]: value }))}
          />
        ))}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Discount" inputMode="decimal" placeholder="0" value={discount} onChange={(e) => setDiscount(toDecimalInput(e.target.value))} />
          <Input
            label="Delivery charge"
            inputMode="decimal"
            placeholder="0"
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(toDecimalInput(e.target.value))}
          />
        </div>
        <Select
          label="Sold by"
          placeholder="Me (logged-in user)"
          options={staff.map((member) => ({ value: member._id, label: member.name }))}
          value={soldBy}
          onChange={(e) => setSoldBy(e.target.value)}
        />

        {toPay > 0 && (
          <PaymentMethodLines
            lines={lines}
            onChange={setEditedLines}
            methods={methods}
            title="Payment"
            addLabel="Add"
            totalLabel="Paying now"
            tone="text-green-600"
          />
        )}
        {refund > 0 && (
          <Select
            label={`Refund ${formatTaka(refund)} from`}
            required
            options={methodOptions(methods)}
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
          />
        )}

        <div className="space-y-1.5 rounded-xl bg-slate-50 p-4">
          <SummaryRow label="Invoice total" value={formatTaka(Math.max(total, 0))} />
          <SummaryRow label="Advance already paid" value={formatTaka(row.paidAmount)} />
          {refund > 0 && <SummaryRow label="Back to the customer" value={formatTaka(refund)} tone="text-amber-700" strong />}
          {toPay > 0 && <SummaryRow label="Paying now" value={formatTaka(paidNow)} tone="text-emerald-700" />}
          {due > 0 && <SummaryRow label="Stays on the customer's balance" value={formatTaka(due)} tone="text-red-600" strong />}
        </div>
      </form>
    </Modal>
  );
};
