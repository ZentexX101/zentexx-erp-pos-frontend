import { useCallback, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import PosCart from "../../components/sale/PosCart";
import PosCustomerPanel from "../../components/sale/PosCustomerPanel";
import PosOrderSummary from "../../components/sale/PosOrderSummary";
import PosProductGrid from "../../components/sale/PosProductGrid";
import SaleInvoicePrint from "../../components/sale/SaleInvoicePrint";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { useCreateSale, useFindSerial } from "../../hooks/useSaleApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { cartError, cartLineQuantity, cartSubTotal, newCartLine, toSaleItems } from "../../utils/sale";

const NO_AMOUNTS = { discount: "", deliveryCharge: "" };

const CreatePos = () => {
  const { user } = useAuth();

  // all states
  const [lines, setLines] = useState([]);
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
  const createSale = useCreateSale();
  const findSerial = useFindSerial();
  usePrintWhenReady(printSale, useCallback(() => setPrintSale(null), []));

  const subTotal = cartSubTotal(lines);
  const grandTotal = Math.max(0, roundTaka(subTotal - (Number(amounts.discount) || 0) + (Number(amounts.deliveryCharge) || 0)));
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const paymentLines = payments ?? [{ key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: grandTotal ? String(grandTotal) : "" }];
  const paid = paymentLinesTotal(paymentLines);
  const due = roundTaka(grandTotal - paid);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  // A product card: add one piece (IMEI products open their IMEI picker in the cart instead)
  const addStock = (stock, serial) => {
    clearMessages();
    setLines((prev) => {
      const index = prev.findIndex((line) => line.stock.product._id === stock.product._id);
      if (index === -1) return [...prev, newCartLine(stock, serial)];
      return prev.map((line, i) => {
        if (i !== index) return line;
        if (stock.product.trackSerial) return serial && !line.serials.includes(serial) ? { ...line, serials: [...line.serials, serial] } : line;
        return { ...line, quantity: String(Math.min((Number(line.quantity) || 0) + 1, stock.quantity)) };
      });
    });
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

  const changeLine = (index, field, value) => setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const resetSale = () => {
    setLines([]);
    setCustomer(null);
    setAmounts(NO_AMOUNTS);
    setPayments(null);
  };

  const handleSubmit = async () => {
    clearMessages();
    const filledPayments = paymentLines.filter((line) => line.paymentMethod || Number(line.amount) > 0);
    const problem =
      cartError(lines) ||
      ((Number(amounts.discount) || 0) > subTotal && "Discount can't be more than the sub total.") ||
      (filledPayments.some((line) => !line.paymentMethod) && "Select the payment method for every paid amount.") ||
      (paid > grandTotal && "Paid amount can't be more than the grand total.") ||
      (due > 0 && !customer && "A walk-in sale must be paid in full. Select a customer to keep a due.");
    if (problem) return setError(problem);

    try {
      const sale = await createSale.mutateAsync({
        customer: customer?._id ?? "",
        soldBy,
        items: toSaleItems(lines),
        discount: Number(amounts.discount) || 0,
        deliveryCharge: Number(amounts.deliveryCharge) || 0,
        payments: toPaymentItems(filledPayments.filter((line) => Number(line.amount) > 0)),
      });
      setLastSale(sale);
      setNotice(`Sale ${sale.invoiceNo} completed: ${formatTaka(sale.grandTotal)}${sale.dueAmount ? `, due ${formatTaka(sale.dueAmount)}` : ""}.`);
      resetSale();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="space-y-4 print:hidden">
        {notice && (
          <Alert type="success">
            <span className="flex flex-wrap items-center justify-between gap-2">
              {notice}
              {lastSale && (
                <Button variant="secondary" onClick={() => setPrintSale(lastSale)}>
                  <LuPrinter className="h-4 w-4" aria-hidden="true" />
                  Print Invoice
                </Button>
              )}
            </span>
          </Alert>
        )}

        <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
          <PosProductGrid
            onAdd={(stock) => addStock(stock)}
            onScan={handleScan}
            inCart={(stock) => lines.some((line) => line.stock.product._id === stock.product._id)}
          />

          <div className="space-y-4">
            <PosCustomerPanel
              soldBy={soldBy}
              onSoldBy={setSoldBy}
              customer={customer}
              onCustomer={setCustomer}
              canCreateCustomer={hasPermission(user, "customer.create")}
            />
            <PosCart lines={lines} onChange={changeLine} onRemove={removeLine} />
            <Alert>{error}</Alert>
            <PosOrderSummary
              itemCount={lines.reduce((sum, line) => sum + cartLineQuantity(line), 0)}
              subTotal={subTotal}
              discount={amounts.discount}
              deliveryCharge={amounts.deliveryCharge}
              onAmount={(field, value) => setAmounts((prev) => ({ ...prev, [field]: value }))}
              grandTotal={grandTotal}
              payments={paymentLines}
              onPayments={setPayments}
              methods={methods}
              paid={paid}
              due={due}
              onPayFull={() => setPayments(null)}
              onSubmit={handleSubmit}
              submitting={createSale.isPending}
              disabled={!lines.length}
            />
          </div>
        </div>
      </div>

      {printSale && <SaleInvoicePrint sale={printSale} />}
    </div>
  );
};

export default CreatePos;
