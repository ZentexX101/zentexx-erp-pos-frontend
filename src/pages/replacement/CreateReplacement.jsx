import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import ReplacementDevicePicker from "../../components/replacement/ReplacementDevicePicker";
import ReplacementPanel from "../../components/replacement/ReplacementPanel";
import ReturnOrderSearch from "../../components/saleReturn/ReturnOrderSearch";
import { ROUTES } from "../../constants/routes";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useCreateReplacement, useLookupReplacement } from "../../hooks/useReplacementApi";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";

const EMPTY_FORM = { newSerial: "", quantity: "1", reason: "", charge: "" };

// Every piece that can be replaced, flat: one row per IMEI, one per other product
const rowsOf = (devices) =>
  devices.flatMap((device) =>
    device.trackSerial
      ? device.serials.map((serial) => ({ key: `${device.product}:${serial}`, device, serial }))
      : device.quantity > 0
        ? [{ key: String(device.product), device, serial: null }]
        : [],
  );

// Swap a faulty piece for a new one of the same product: find the invoice, pick the piece, pick the new one
const CreateReplacement = () => {
  // all states
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  // null = follow the charge on the default method; a list once edited
  const [paymentLines, setPaymentLines] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  // call replacement api
  const lookup = useLookupReplacement();
  const create = useCreateReplacement();
  const { data: methods = [] } = usePaymentMethodOptionsData();

  const rows = found ? rowsOf(found.devices) : [];
  const row = rows.find((r) => r.key === picked) ?? null;
  const charge = Number(form.charge) || 0;
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const lines = paymentLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: charge ? String(charge) : "" }];
  const paid = charge > 0 ? paymentLinesTotal(lines) : 0;

  const reset = () => {
    setPicked("");
    setForm(EMPTY_FORM);
    setPaymentLines(null);
  };

  const handleSearch = async (q) => {
    setError("");
    setSaved(null);
    setSearching(true);
    try {
      setFound(await lookup(q));
      reset();
    } catch (err) {
      setFound(null);
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handlePick = (key) => {
    setError("");
    setPicked(key);
    setForm((prev) => ({ ...prev, newSerial: "", quantity: "1" }));
  };

  const handleField = (name, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const quantity = Number(form.quantity) || 0;
    const filled = charge > 0 ? lines.filter((line) => line.paymentMethod || Number(line.amount) > 0) : [];
    const problem =
      (row.serial && !form.newSerial && "Select the new IMEI.") ||
      (!row.serial && (quantity < 1 || quantity > row.device.quantity) && `Enter 1 to ${row.device.quantity} pieces.`) ||
      (!form.reason.trim() && "Say what's wrong with it.") ||
      (filled.length > 0 && paymentLinesError(filled, methods, { checkBalance: false })) ||
      (paid > charge && "Paid amount can't be more than the charge.") ||
      (paid < charge && !found.sale.customer && "This was a walk-in sale, so the charge must be paid in full.");
    if (problem) return setError(problem);

    try {
      const result = await create.mutateAsync({
        sale: found.sale._id,
        product: String(row.device.product),
        oldSerial: row.serial ?? "",
        newSerial: form.newSerial,
        quantity,
        reason: form.reason.trim(),
        charge,
        payments: toPaymentItems(filled.filter((line) => Number(line.amount) > 0)),
      });
      setSaved(result);
      setFound(null);
      reset();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create Replacement" subtitle="Swap a faulty piece for a new one of the same product. For a different model, use Exchange." />

      <ReturnOrderSearch onSearch={handleSearch} searching={searching} placeholder="Invoice no. (INV-000001) or the faulty phone's IMEI..." />

      {saved && (
        <Alert type="success">
          <span className="font-semibold">{saved.replacementNo}</span>: {saved.productName}
          {saved.oldSerial ? ` ${saved.oldSerial} replaced with ${saved.newSerial}` : `, ${saved.quantity} pcs replaced`}.{" "}
          <Link to={ROUTES.BRANCH_REPLACEMENTS} className="font-semibold underline">
            View replacement list
          </Link>
        </Alert>
      )}
      <Alert>{error}</Alert>

      {found && (
        <div className="grid items-start gap-4 xl:grid-cols-[3fr_2fr]">
          <ReplacementDevicePicker found={found} rows={rows} picked={picked} onPick={handlePick} />
          <ReplacementPanel
            row={row}
            form={form}
            onField={handleField}
            lines={lines}
            onLines={setPaymentLines}
            paid={paid}
            methods={methods}
            onSubmit={handleSubmit}
            submitting={create.isPending}
            walkIn={!found.sale.customer}
          />
        </div>
      )}
    </div>
  );
};

export default CreateReplacement;
