import { useCallback, useState } from "react";
import { LuArrowLeft, LuBellRing, LuPackageCheck, LuPencil, LuPhone, LuPlus, LuPrinter } from "react-icons/lu";
import { Link, useParams } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Badge from "../../components/common/data/Badge";
import { PreOrderAdvanceModal, PreOrderCancelModal, PreOrderEditModal, PreOrderSellModal } from "../../components/preOrder/PreOrderModals";
import PreOrderSlip from "../../components/preOrder/PreOrderSlip";
import SaleInvoicePrint from "../../components/sale/SaleInvoicePrint";
import { HISTORY_LABELS, PRE_ORDER_STATUS } from "../../constants/preOrder";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import {
  useAddPreOrderPayment,
  useCancelPreOrder,
  useMarkPreOrderNotified,
  usePreOrderData,
  usePreOrderOptions,
  useSellPreOrder,
  useUpdatePreOrder,
} from "../../hooks/usePreOrderApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { hasPermission } from "../../utils/access";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { formatPhone } from "../../utils/phone";
import { preOrderTitle } from "../../utils/preOrder";

const Card = ({ title, action, children }) => (
  <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
    <div className="px-5 py-4">{children}</div>
  </section>
);

const Fact = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium text-slate-500">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{children}</dd>
  </div>
);

const MoneyRow = ({ label, value, tone = "text-slate-900", strong }) => (
  <div className={`flex items-center justify-between gap-3 py-1.5 text-sm ${strong ? "font-semibold" : ""}`}>
    <span className="text-slate-600">{label}</span>
    <span className={`font-semibold tabular-nums ${tone}`}>{formatTaka(value)}</span>
  </div>
);

const SmallAction = ({ icon, children, ...props }) => {
  const Icon = icon;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
      {...props}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </button>
  );
};

// Everything that happened, newest first
const activityOf = (row) =>
  [
    ...row.history.map((line) => ({ date: line.date, by: line.by?.name, title: HISTORY_LABELS[line.event], note: line.note, dot: "bg-slate-400" })),
    ...row.payments.map((line) => ({
      date: line.date,
      by: line.by?.name,
      title: `Advance ${formatTaka(line.amount)}`,
      note: line.paymentMethod?.name,
      dot: "bg-emerald-500",
    })),
    ...(row.invoice?.payments ?? []).map((line) => ({
      date: row.closedAt,
      by: row.invoice.createdBy?.name,
      title: `Paid at sale ${formatTaka(line.amount)}`,
      note: line.paymentMethod?.name,
      dot: "bg-emerald-500",
    })),
    ...(row.refundAmount > 0 ? [{ date: row.closedAt, title: `Refund ${formatTaka(row.refundAmount)}`, note: row.refundMethod?.name, dot: "bg-red-500" }] : []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

// Says plainly where the booking stands against the stock
const StockNote = ({ row }) => {
  if (row.ready)
    return (
      <p className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <LuPackageCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-semibold">Stock is here</span> and this booking is next in line. The POS can still sell it, so tell the customer soon.
        </span>
      </p>
    );
  const anyHere = row.items.some((item) => item.inStock > 0);
  return (
    <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {anyHere ? "Not ready yet: something is still missing, or older bookings are ahead of this one." : "None of this is in this branch yet."}
    </p>
  );
};

// One booking from start to finish
const PreOrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canEdit = hasPermission(user, "pre_order.edit");

  // all states
  const [modal, setModal] = useState(null); // advance | edit | sell | cancel
  const [printing, setPrinting] = useState(null); // "slip" | "invoice"
  const [error, setError] = useState("");

  // call pre order api
  const { data: row, isLoading, error: loadError } = usePreOrderData(id);
  const { data: options } = usePreOrderOptions();
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const update = useUpdatePreOrder();
  const addPayment = useAddPreOrderPayment();
  const notify = useMarkPreOrderNotified();
  const sell = useSellPreOrder();
  const cancel = useCancelPreOrder();
  usePrintWhenReady(
    printing,
    useCallback(() => setPrinting(null), []),
  );

  // Saves from a modal and closes it; a refusal stays in the modal
  const saveFrom = (mutation) => async (data) => {
    await mutation.mutateAsync({ id, data });
    setModal(null);
  };

  const markTold = async () => {
    setError("");
    try {
      await notify.mutateAsync({ id });
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden="true" />;
  if (!row) return <Alert>{loadError?.message ?? "Pre order not found."}</Alert>;

  const booked = row.status === "booked";
  const invoice = row.invoice;

  return (
    <div>
      <div className="space-y-5 print:hidden">
        <Link to={ROUTES.BRANCH_PRE_ORDERS} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <LuArrowLeft className="size-4" aria-hidden="true" />
          Pre Orders
        </Link>

        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-500">{row.preOrderNo}</span>
                {row.ready ? (
                  <Badge dot tone="amber">
                    Stock arrived
                  </Badge>
                ) : (
                  <Badge dot tone={PRE_ORDER_STATUS[row.status].tone}>
                    {PRE_ORDER_STATUS[row.status].label}
                  </Badge>
                )}
              </p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{preOrderTitle(row)}</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Booked {formatDateTime(row.bookedAt)}
                {row.createdBy?.name ? ` by ${row.createdBy.name}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {invoice ? (
                <Button variant="secondary" onClick={() => setPrinting("invoice")}>
                  <LuPrinter className="size-4" aria-hidden="true" />
                  Print invoice
                </Button>
              ) : (
                booked && (
                  <Button variant="secondary" onClick={() => setPrinting("slip")}>
                    <LuPrinter className="size-4" aria-hidden="true" />
                    Print slip
                  </Button>
                )
              )}
              {canEdit && booked && <Button onClick={() => setModal("sell")}>Sell</Button>}
            </div>
          </div>

          {booked && <StockNote row={row} />}

          {canEdit && booked && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {row.ready && !row.notifiedAt && (
                <SmallAction icon={LuBellRing} onClick={markTold} disabled={notify.isPending}>
                  Customer told
                </SmallAction>
              )}
              <SmallAction icon={LuPencil} onClick={() => setModal("edit")}>
                Edit
              </SmallAction>
              <button
                type="button"
                onClick={() => setModal("cancel")}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50"
              >
                Cancel pre order
              </button>
            </div>
          )}
        </section>

        <Alert>{error}</Alert>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-5">
            <Card title="Products">
              <ul className="divide-y divide-slate-100">
                {row.items.map((item) => (
                  <li key={item.product} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block font-medium uppercase text-slate-900 [overflow-wrap:anywhere]">{item.name}</span>
                      <span className="block text-xs text-slate-500">
                        {item.quantity} × {formatTaka(item.unitPrice)}
                        {booked && ` · ${item.inStock} in this branch`}
                        {booked && item.stockPrice ? ` · selling at ${formatTaka(item.stockPrice)}` : ""}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900">{formatTaka(item.total)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Booking">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Fact label="Booked by">{row.bookedBy?.name ?? "—"}</Fact>
                <Fact label="Expected by">{row.expectedDate ? formatDate(row.expectedDate) : "—"}</Fact>
                {row.notifiedAt && <Fact label="Customer told">{formatDateTime(row.notifiedAt)}</Fact>}
                {row.note && (
                  <div className="sm:col-span-2">
                    <Fact label="Note">{row.note}</Fact>
                  </div>
                )}
              </dl>
            </Card>

            <Card title="What happened">
              <ol className="space-y-3">
                {activityOf(row).map((line, index) => (
                  <li key={`${line.title}-${index}`} className="flex gap-3 text-sm">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${line.dot}`} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900 [overflow-wrap:anywhere]">{line.title}</span>
                      {line.note && <span className="block text-slate-600 [overflow-wrap:anywhere]">{line.note}</span>}
                      <span className="block text-xs text-slate-500">
                        {formatDateTime(line.date)}
                        {line.by ? ` · ${line.by}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card title="Customer">
              <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">{row.customerName}</p>
              <a href={`tel:${row.customerPhone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <LuPhone className="size-3.5" aria-hidden="true" />
                {formatPhone(row.customerPhone)}
              </a>
            </Card>

            <Card
              title="Money"
              action={
                canEdit &&
                booked && (
                  <SmallAction icon={LuPlus} onClick={() => setModal("advance")}>
                    Advance
                  </SmallAction>
                )
              }
            >
              <div className="divide-y divide-slate-100">
                {invoice ? (
                  <>
                    <MoneyRow label="Invoice total" value={invoice.grandTotal} />
                    <MoneyRow label="Advance used" value={invoice.advanceAmount} tone="text-emerald-700" />
                    <MoneyRow label="Paid at sale" value={roundTaka(invoice.paidAmount - invoice.advanceAmount)} tone="text-emerald-700" />
                    {row.refundAmount > 0 && <MoneyRow label="Refunded" value={row.refundAmount} tone="text-amber-700" />}
                    {invoice.dueAmount > 0 && <MoneyRow label="Due at sale" value={invoice.dueAmount} tone="text-red-600" strong />}
                  </>
                ) : (
                  <>
                    <MoneyRow label="Subtotal" value={row.subTotal ?? row.total} />
                    {row.discount > 0 && <MoneyRow label="Discount" value={row.discount} tone="text-red-600" />}
                    {row.deliveryCharge > 0 && <MoneyRow label="Delivery charge" value={row.deliveryCharge} />}
                    <MoneyRow label="Total" value={row.total} strong />
                    <MoneyRow label="Advance paid" value={row.paidAmount} tone="text-emerald-700" />
                    {row.refundAmount > 0 ? (
                      <MoneyRow label="Refunded" value={row.refundAmount} tone="text-amber-700" />
                    ) : (
                      <MoneyRow label="Left to pay" value={Math.max(roundTaka(row.total - row.paidAmount), 0)} strong />
                    )}
                  </>
                )}
              </div>
              {invoice && (
                <p className="mt-2 text-sm text-slate-600">
                  Invoice <span className="font-mono font-semibold text-slate-900">{invoice.invoiceNo}</span>
                </p>
              )}
              {booked && <p className="mt-2 text-xs leading-relaxed text-slate-500">The advance isn't income until this is sold.</p>}
            </Card>
          </div>
        </div>
      </div>

      {printing === "slip" && <PreOrderSlip row={row} />}
      {printing === "invoice" && invoice && <SaleInvoicePrint sale={invoice} />}

      {modal === "advance" && <PreOrderAdvanceModal methods={methods} onClose={() => setModal(null)} onSubmit={saveFrom(addPayment)} />}
      {modal === "edit" && <PreOrderEditModal row={row} onClose={() => setModal(null)} onSubmit={saveFrom(update)} />}
      {modal === "cancel" && <PreOrderCancelModal row={row} methods={methods} onClose={() => setModal(null)} onSubmit={saveFrom(cancel)} />}
      {modal === "sell" && (
        <PreOrderSellModal row={row} methods={methods} staff={options?.staff ?? []} onClose={() => setModal(null)} onSubmit={saveFrom(sell)} />
      )}
    </div>
  );
};

export default PreOrderDetail;
