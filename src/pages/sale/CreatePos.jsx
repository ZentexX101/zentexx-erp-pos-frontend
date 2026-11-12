import { useCallback, useState } from "react";
import { LuPrinter, LuShoppingCart } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import PosCart from "../../components/sale/PosCart";
import PosCustomerPanel from "../../components/sale/PosCustomerPanel";
import PosOrderSummary from "../../components/sale/PosOrderSummary";
import PosProductGrid from "../../components/sale/PosProductGrid";
import ExternalProductModal from "../../components/sale/ExternalProductModal";
import SaleInvoicePrint from "../../components/sale/SaleInvoicePrint";
import ServiceFormModal from "../../components/service/ServiceFormModal";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { useCreateSale, useFindSerial } from "../../hooks/useSaleApi";
import { useServiceOptionsData } from "../../hooks/useServiceApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import {
  externalQuantity,
  externalsTotal,
  toExternalItems,
} from "../../utils/externalProduct";
import {
  addToCart,
  cartError,
  cartLineQuantity,
  cartSubTotal,
  toggleInCart,
  toSaleItems,
} from "../../utils/sale";

const NO_AMOUNTS = { discount: "", deliveryCharge: "" };

const CreatePos = () => {
  const { user } = useAuth();

  // all states
  const [lines, setLines] = useState([]);
  // Products brought in from elsewhere for this sale; editingExternal: null, "new", or the index being edited
  const [externals, setExternals] = useState([]);
  const [editingExternal, setEditingExternal] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [soldBy, setSoldBy] = useState("");
  const [amounts, setAmounts] = useState(NO_AMOUNTS);
  // null = "pay in full with the default method" (follows the grand total); a list once edited
  const [payments, setPayments] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lastSale, setLastSale] = useState(null);
  const [printSale, setPrintSale] = useState(null);

  // call pos api
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const { data: serviceOptions = [] } = useServiceOptionsData();

  // "Create new service" from a cart line: the form opens here; an active new service is picked on that line
  const [serviceFor, setServiceFor] = useState(null); // product id of that line
  const canCreateService = hasPermission(user, "service.create");
  const handleServiceCreated = (saved) => {
    if (saved?.status === "active") {
      const picked = { _id: saved._id, name: saved.name, pricePercent: saved.pricePercent, incentivePercent: saved.incentivePercent };
      setLines((prev) =>
        prev.map((line) => (line.stock.product._id === serviceFor ? { ...line, services: [...(line.services ?? []), picked] } : line)),
      );
    }
    setServiceFor(null);
  };
  const createSale = useCreateSale();
  const findSerial = useFindSerial();
  usePrintWhenReady(
    printSale,
    useCallback(() => setPrintSale(null), []),
  );

  const subTotal = roundTaka(cartSubTotal(lines) + externalsTotal(externals));
  const grandTotal = Math.max(
    0,
    roundTaka(
      subTotal -
        (Number(amounts.discount) || 0) +
        (Number(amounts.deliveryCharge) || 0),
    ),
  );
  // Pieces in the cart (stock lines and external ones)
  const cartCount =
    lines.reduce((sum, line) => sum + cartLineQuantity(line), 0) +
    externals.reduce((sum, line) => sum + externalQuantity(line), 0);
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const paymentLines = payments ?? [
    {
      key: "auto",
      paymentMethod: defaultMethod?._id ?? "",
      amount: grandTotal ? String(grandTotal) : "",
    },
  ];
  const paid = paymentLinesTotal(paymentLines);
  const due = roundTaka(grandTotal - paid);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  // A product card: add it (IMEI products open their IMEI picker in the cart), or take it out when it's in the cart
  const toggleStock = (stock) => {
    clearMessages();
    setLines((prev) => toggleInCart(prev, stock));
  };

  // A scanned piece: add it to the cart
  const addStock = (stock, serial) => {
    clearMessages();
    setLines((prev) => addToCart(prev, stock, serial));
  };

  // Scanned IMEI -> add that exact piece; returns true when it was added
  const handleScan = async (serial) => {
    try {
      const found = await findSerial(serial);
      addStock(found.stock, found.serial);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const changeLine = (index, field, value) =>
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    );
  const removeLine = (index) =>
    setLines((prev) => prev.filter((_, i) => i !== index));

  const resetSale = () => {
    setLines([]);
    setExternals([]);
    setCustomer(null);
    setAmounts(NO_AMOUNTS);
    setPayments(null);
  };

  const handleSubmit = async () => {
    clearMessages();
    const filledPayments = paymentLines.filter(
      (line) => line.paymentMethod || Number(line.amount) > 0,
    );
    const problem =
      ((lines.length > 0 || externals.length === 0) && cartError(lines)) ||
      ((Number(amounts.discount) || 0) > subTotal &&
        "Discount can't be more than the sub total.") ||
      (filledPayments.some((line) => !line.paymentMethod) &&
        "Select the payment method for every paid amount.") ||
      (paid > grandTotal &&
        "Paid amount can't be more than the grand total.") ||
      (due > 0 &&
        !customer &&
        "A walk-in sale must be paid in full. Select a customer to keep a due.");
    if (problem) return setError(problem);

    try {
      const sale = await createSale.mutateAsync({
        customer: customer?._id ?? "",
        soldBy,
        items: toSaleItems(lines),
        externalItems: toExternalItems(externals),
        discount: Number(amounts.discount) || 0,
        deliveryCharge: Number(amounts.deliveryCharge) || 0,
        payments: toPaymentItems(
          filledPayments.filter((line) => Number(line.amount) > 0),
        ),
      });
      setLastSale(sale);
      setNotice(
        `Sale ${sale.invoiceNo} completed: ${formatTaka(sale.grandTotal)}${sale.dueAmount ? `, due ${formatTaka(sale.dueAmount)}` : ""}.`,
      );
      resetSale();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div
        className={`space-y-4 print:hidden ${cartCount > 0 ? "max-xl:pb-20" : ""}`}
      >
        {notice && (
          <Alert type="success">
            <span className="flex flex-wrap items-center justify-between gap-2">
              {notice}
              {lastSale && (
                <Button
                  variant="secondary"
                  onClick={() => setPrintSale(lastSale)}
                >
                  <LuPrinter className="h-4 w-4" aria-hidden="true" />
                  Print Invoice
                </Button>
              )}
            </span>
          </Alert>
        )}

        <div className="grid gap-4 xl:grid-cols-[3fr_2fr] [&>*]:min-w-0">
          {/* Wide screens: the products stay put while the cart side scrolls; a long list scrolls on its own */}
          <div className="xl:sticky xl:top-0 xl:-m-1 xl:max-h-[calc(100dvh-8rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:p-1 xl:[scrollbar-width:thin]">
            <PosProductGrid
              onAdd={toggleStock}
              onScan={handleScan}
              inCart={(stock) =>
                lines.some((line) => line.stock.product._id === stock.product._id)
              }
            />
          </div>

          <div className="space-y-4">
            <PosCustomerPanel
              soldBy={soldBy}
              onSoldBy={setSoldBy}
              customer={customer}
              onCustomer={setCustomer}
              canCreateCustomer={hasPermission(user, "customer.create")}
            />
            <div id="pos-cart" className="scroll-mt-20">
              <PosCart
                lines={lines}
                onChange={changeLine}
                onRemove={removeLine}
                serviceOptions={serviceOptions}
                onCreateService={canCreateService ? (index) => setServiceFor(lines[index].stock.product._id) : undefined}
                externals={externals}
                onAddExternal={() => setEditingExternal("new")}
                onEditExternal={(index) => setEditingExternal(index)}
                onRemoveExternal={(index) =>
                  setExternals((prev) => prev.filter((_, i) => i !== index))
                }
              />
            </div>
            <Alert>{error}</Alert>
            <PosOrderSummary
              itemCount={cartCount}
              subTotal={subTotal}
              discount={amounts.discount}
              deliveryCharge={amounts.deliveryCharge}
              onAmount={(field, value) =>
                setAmounts((prev) => ({ ...prev, [field]: value }))
              }
              grandTotal={grandTotal}
              payments={paymentLines}
              onPayments={setPayments}
              methods={methods}
              paid={paid}
              due={due}
              onPayFull={() => setPayments(null)}
              onSubmit={handleSubmit}
              submitting={createSale.isPending}
              disabled={!lines.length && !externals.length}
            />
          </div>
        </div>
      </div>

      {/* Phones / tablets: the cart sits under the products, so a floating bar shows what is in it and jumps there */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("pos-cart")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl shadow-slate-900/30 sm:left-auto sm:w-96 xl:hidden print:hidden"
        >
          <span className="flex items-center gap-2.5">
            <span className="relative">
              <LuShoppingCart className="size-5" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold">
                {cartCount}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatTaka(grandTotal)}
            </span>
          </span>
          <span className="text-sm font-semibold text-emerald-300">
            View cart →
          </span>
        </button>
      )}

      {editingExternal !== null && (
        <ExternalProductModal
          line={editingExternal === "new" ? null : externals[editingExternal]}
          onClose={() => setEditingExternal(null)}
          onSave={(line) => {
            clearMessages();
            setExternals((prev) =>
              editingExternal === "new"
                ? [...prev, line]
                : prev.map((old, i) => (i === editingExternal ? line : old)),
            );
            setEditingExternal(null);
          }}
        />
      )}

      {serviceFor && <ServiceFormModal service={null} onClose={() => setServiceFor(null)} onSaved={handleServiceCreated} />}

      {printSale && <SaleInvoicePrint sale={printSale} />}
    </div>
  );
};

export default CreatePos;
