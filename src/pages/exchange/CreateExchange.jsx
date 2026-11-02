import { useCallback, useState } from "react";
import { LuPrinter } from "react-icons/lu";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import PageHeader from "../../components/common/layout/PageHeader";
import ExchangeSummary from "../../components/exchange/ExchangeSummary";
import TradeInPanel from "../../components/exchange/TradeInPanel";
import PosCart from "../../components/sale/PosCart";
import PosCustomerPanel from "../../components/sale/PosCustomerPanel";
import PosProductGrid from "../../components/sale/PosProductGrid";
import SaleInvoicePrint from "../../components/sale/SaleInvoicePrint";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { useCreateExchange, useFindSerial } from "../../hooks/useSaleApi";
import { hasPermission } from "../../utils/access";
import { newTradeIn, toTradeIns, tradeInsError, tradeInsTotal } from "../../utils/exchange";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { addToCart, cartError, cartLineQuantity, cartSubTotal, toSaleItems } from "../../utils/sale";

// New Exchange: sell new items and take the customer's old devices in, on one invoice.
// Without new items it is a buyback: we only buy the old device from the customer.
const CreateExchange = () => {
  const { user } = useAuth();

  // all states
  const [lines, setLines] = useState([]);
  const [tradeIns, setTradeIns] = useState(() => [newTradeIn()]);
  const [customer, setCustomer] = useState(null);
  const [soldBy, setSoldBy] = useState("");
  const [discount, setDiscount] = useState("");
  // null = settle the whole payable with the default method (follows the totals); a list once edited
  const [payments, setPayments] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lastExchange, setLastExchange] = useState(null);
  const [printSale, setPrintSale] = useState(null);

  // call exchange api
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const createExchange = useCreateExchange();
  const findSerial = useFindSerial();
  usePrintWhenReady(printSale, useCallback(() => setPrintSale(null), []));

  const subTotal = cartSubTotal(lines);
  const exchangeValue = tradeInsTotal(tradeIns);
  const payable = roundTaka(subTotal - (Number(discount) || 0) - exchangeValue);
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const paymentLines = payments ?? [{ key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: payable ? String(Math.abs(payable)) : "" }];
  const settled = paymentLinesTotal(paymentLines);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const addStock = (stock, serial) => {
    clearMessages();
    setLines((prev) => addToCart(prev, stock, serial));
  };

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

  const handleSubmit = async () => {
    clearMessages();
    const filled = paymentLines.filter((line) => line.paymentMethod || Number(line.amount) > 0);
    const problem =
      (!customer && "Select the customer whose old device you're taking in.") ||
      tradeInsError(tradeIns) ||
      (lines.length > 0 && cartError(lines)) ||
      ((Number(discount) || 0) > subTotal && "Discount can't be more than the new product total.") ||
      (filled.some((line) => !line.paymentMethod) && "Select the payment method for every amount.") ||
      (settled > Math.abs(payable) && (payable >= 0 ? "Paid amount can't be more than the payable amount." : "Payout can't be more than what we owe."));
    if (problem) return setError(problem);

    try {
      const sale = await createExchange.mutateAsync({
        customer: customer._id,
        soldBy,
        items: toSaleItems(lines),
        tradeIns: toTradeIns(tradeIns),
        discount: Number(discount) || 0,
        payments: payable === 0 ? [] : toPaymentItems(filled.filter((line) => Number(line.amount) > 0)),
      });
      setLastExchange(sale);
      setNotice(`Exchange ${sale.invoiceNo} completed. ${sale.payable >= 0 ? `Received ${formatTaka(sale.paidAmount)}` : `Paid out ${formatTaka(sale.payoutAmount)}`}.`);
      setLines([]);
      setTradeIns([newTradeIn()]);
      setCustomer(null);
      setDiscount("");
      setPayments(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="space-y-4 print:hidden">
        <PageHeader
          title="New Exchange / Buyback"
          subtitle="Sell new products and take the customer's old device in, on one invoice. Leave the cart empty to only buy the old device."
        />

        {notice && (
          <Alert type="success">
            <span className="flex flex-wrap items-center justify-between gap-2">
              {notice}
              {lastExchange && (
                <Button variant="secondary" onClick={() => setPrintSale(lastExchange)}>
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
              customerLabel="Customer (required)"
            />
            <PosCart lines={lines} onChange={changeLine} onRemove={removeLine} />
            <TradeInPanel lines={tradeIns} onChange={setTradeIns} />
            <Alert>{error}</Alert>
            <ExchangeSummary
              itemCount={lines.reduce((sum, line) => sum + cartLineQuantity(line), 0)}
              subTotal={subTotal}
              discount={discount}
              onDiscount={setDiscount}
              exchangeValue={exchangeValue}
              payable={payable}
              payments={paymentLines}
              onPayments={setPayments}
              methods={methods}
              settled={settled}
              onSettleFull={() => setPayments(null)}
              submitLabel={lines.length ? "Complete Exchange" : "Complete Buyback"}
              onSubmit={handleSubmit}
              submitting={createExchange.isPending}
            />
          </div>
        </div>
      </div>

      {printSale && <SaleInvoicePrint sale={printSale} />}
    </div>
  );
};

export default CreateExchange;
