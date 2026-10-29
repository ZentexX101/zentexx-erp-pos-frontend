import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import ReturnOrderItems from "../../components/saleReturn/ReturnOrderItems";
import ReturnOrderSearch from "../../components/saleReturn/ReturnOrderSearch";
import ReturnRefundPanel from "../../components/saleReturn/ReturnRefundPanel";
import { ROUTES } from "../../constants/routes";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useCreateSaleReturn, useLookupSale } from "../../hooks/useSaleReturnApi";
import { formatTaka } from "../../utils/money";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { returnPicksError, returnTotal, suggestedRefund, toReturnItems } from "../../utils/saleReturn";

const CreatePosReturn = () => {
  // all states
  const [sale, setSale] = useState(null);
  const [searching, setSearching] = useState(false);
  const [picks, setPicks] = useState({});
  // null = follow the suggested refund on the default method; a list once edited
  const [refundLines, setRefundLines] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  // call pos return api
  const lookupSale = useLookupSale();
  const createReturn = useCreateSaleReturn();
  const { data: methods = [] } = usePaymentMethodOptionsData();

  const total = sale ? returnTotal(sale, picks) : 0;
  const suggested = sale ? suggestedRefund(sale, total) : 0;
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const lines = refundLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: suggested ? String(suggested) : "" }];
  const refund = paymentLinesTotal(lines);

  const handleSearch = async (q) => {
    setError("");
    setSaved(null);
    setSearching(true);
    try {
      setSale(await lookupSale(q));
      setPicks({});
      setRefundLines(null);
      setNote("");
    } catch (err) {
      setSale(null);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePick = (productId, pick) => {
    setError("");
    setPicks((prev) => ({ ...prev, [productId]: pick }));
  };

  const handleSubmit = async () => {
    const filled = lines.filter((line) => line.paymentMethod || Number(line.amount) > 0);
    const problem =
      returnPicksError(sale, picks) ||
      (filled.length > 0 && paymentLinesError(filled, methods, { checkBalance: true })) ||
      (refund > total && "Refund can't be more than the return total.") ||
      (!sale.customer && refund !== total && "A walk-in customer must get the whole return amount back.");
    if (problem) return setError(problem);

    try {
      const result = await createReturn.mutateAsync({ sale: sale._id, items: toReturnItems(sale, picks), refunds: toPaymentItems(filled), note: note.trim() });
      setSaved(result);
      setSale(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create POS Return" subtitle="Search for an order and process a return" />

      <ReturnOrderSearch onSearch={handleSearch} searching={searching} />

      {saved && (
        <Alert type="success">
          Return <span className="font-semibold">{saved.returnNo}</span> saved for {saved.invoiceNo}: {formatTaka(saved.totalAmount)} back in stock,{" "}
          {formatTaka(saved.refundAmount)} refunded.{" "}
          <Link to={ROUTES.BRANCH_POS_RETURNS} className="font-semibold underline">
            View return list
          </Link>
        </Alert>
      )}
      <Alert>{error}</Alert>

      {sale && (
        <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
          <ReturnOrderItems sale={sale} picks={picks} onPick={handlePick} />
          <ReturnRefundPanel
            sale={sale}
            total={total}
            refund={refund}
            suggested={suggested}
            lines={lines}
            onLines={setRefundLines}
            onSuggest={() => setRefundLines(null)}
            methods={methods}
            note={note}
            onNote={setNote}
            onSubmit={handleSubmit}
            submitting={createReturn.isPending}
          />
        </div>
      )}
    </div>
  );
};

export default CreatePosReturn;
