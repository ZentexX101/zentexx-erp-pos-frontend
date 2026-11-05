import { useState } from "react";
import { LuInfo } from "react-icons/lu";
import { useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import CustomerFormModal from "../../components/customer/CustomerFormModal";
import CustomerSelect from "../../components/customer/CustomerSelect";
import PreOrderCart from "../../components/preOrder/PreOrderCart";
import PreOrderProductGrid from "../../components/preOrder/PreOrderProductGrid";
import CompactPaymentRows from "../../components/sale/CompactPaymentRows";
import { preOrderDetailPath } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useCreatePreOrder, usePreOrderOptions } from "../../hooks/usePreOrderApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput } from "../../utils/number";
import { paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { addToCart, cartError, cartSubTotal, toCartItems } from "../../utils/preOrder";

const amountClass =
  "w-32 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-right text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// Book products that aren't here yet, for a saved customer, with an advance of at least 1 taka
const CreatePreOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // all states
  const [customer, setCustomer] = useState(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [bookedBy, setBookedBy] = useState("");
  const [lines, setLines] = useState([]);
  const [discount, setDiscount] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [note, setNote] = useState("");
  const [editedAdvance, setEditedAdvance] = useState(null); // null = one empty line on the default method
  const [error, setError] = useState("");

  // call pre order api
  const create = useCreatePreOrder();
  const { data: options } = usePreOrderOptions();
  const { data: methods = [] } = usePaymentMethodOptionsData();

  const subTotal = cartSubTotal(lines);
  const grandTotal = Math.max(roundTaka(subTotal - (Number(discount) || 0) + (Number(deliveryCharge) || 0)), 0);
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const advanceLines = editedAdvance ?? [{ key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: "" }];
  const advance = paymentLinesTotal(advanceLines);
  const remaining = roundTaka(grandTotal - advance);

  const handleSubmit = async () => {
    const filled = advanceLines.filter((line) => Number(line.amount) > 0);
    const problem =
      (!customer && "Pick the customer, or add a new one.") ||
      cartError(lines) ||
      ((Number(discount) || 0) > subTotal && "Discount can't be more than the sub total.") ||
      (advance < 1 && "Take an advance of at least ৳1.") ||
      paymentLinesError(filled) ||
      (remaining < 0 && "The advance can't be more than the grand total.");
    if (problem) return setError(problem);

    setError("");
    try {
      const booking = await create.mutateAsync({
        customer: customer._id,
        bookedBy,
        items: toCartItems(lines),
        discount: Number(discount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        expectedDate,
        note: note.trim(),
        payments: toPaymentItems(filled),
      });
      navigate(preOrderDetailPath(booking._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="New Pre Order" subtitle="Book products that aren't in this branch yet. The advance stays the customer's money until it's sold." />

      <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
        <PreOrderProductGrid
          onAdd={(product) => {
            setError("");
            setLines((prev) => addToCart(prev, product));
          }}
          isAdded={(product) => lines.some((line) => line.product._id === product._id)}
        />

        <div className="min-w-0 space-y-4">
          <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <CustomerSelect value={customer} onChange={setCustomer} />
              </div>
              {hasPermission(user, "customer.create") && (
                <Button variant="secondary" onClick={() => setCreatingCustomer(true)} className="shrink-0">
                  <Icon name="plus" />
                  <span className="hidden sm:inline">New Customer</span>
                  <span className="sr-only sm:hidden">New Customer</span>
                </Button>
              )}
            </div>
            <Select
              label="Booked by"
              placeholder="Me (logged-in user)"
              options={(options?.staff ?? []).map((member) => ({ value: member._id, label: member.name }))}
              value={bookedBy}
              onChange={(e) => setBookedBy(e.target.value)}
            />
          </section>

          <PreOrderCart lines={lines} onChange={setLines} />

          <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
            {!customer && (
              <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <LuInfo className="size-4 shrink-0" aria-hidden="true" />A pre order needs a customer. Pick one or add a new one.
              </p>
            )}
            <p className="flex items-center justify-between gap-3 text-sm text-slate-600">
              Subtotal
              <span className="font-semibold tabular-nums text-slate-900">{formatTaka(subTotal)}</span>
            </p>
            <label className="flex items-center justify-between gap-3 text-sm text-slate-600">
              Discount
              <input
                inputMode="decimal"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(toDecimalInput(e.target.value))}
                className={amountClass}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-slate-600">
              Delivery Charge
              <input
                inputMode="decimal"
                placeholder="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(toDecimalInput(e.target.value))}
                className={amountClass}
              />
            </label>
            <p className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 font-bold text-slate-900">
              Grand Total
              <span className="tabular-nums">{formatTaka(grandTotal)}</span>
            </p>

            <CompactPaymentRows title="Advance payment (min ৳1)" lines={advanceLines} onChange={setEditedAdvance} methods={methods} />

            <div className="rounded-lg bg-amber-50 px-3 py-2">
              <p className="flex items-center justify-between gap-3 text-sm font-semibold text-amber-900">
                Remaining Due
                <span className="tabular-nums">{formatTaka(Math.max(remaining, 0))}</span>
              </p>
              <p className="mt-0.5 text-xs text-amber-800">Whatever is still unpaid when it's sold stays on the customer's balance.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Expected by" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
              <Input label="Order note" maxLength={500} placeholder="Color, RAM, instructions..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <Alert>{error}</Alert>
            <Button onClick={handleSubmit} loading={create.isPending} disabled={!customer || !lines.length} className="w-full rounded-xl py-3">
              Create Pre Order
            </Button>
          </section>
        </div>
      </div>

      {creatingCustomer && (
        <CustomerFormModal
          customer={null}
          onClose={() => setCreatingCustomer(false)}
          onSaved={(saved) => {
            setCreatingCustomer(false);
            setCustomer(saved);
          }}
        />
      )}
    </div>
  );
};

export default CreatePreOrder;
