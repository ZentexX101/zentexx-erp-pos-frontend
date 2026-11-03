import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import ReturnOrderSearch from "../../components/saleReturn/ReturnOrderSearch";
import ServiceDevicePicker from "../../components/serviceSale/ServiceDevicePicker";
import ServiceSaleGuide from "../../components/serviceSale/ServiceSaleGuide";
import ServiceSalePanel from "../../components/serviceSale/ServiceSalePanel";
import { isMainAdmin } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useSaleStaffData, useSalesData } from "../../hooks/useSaleApi";
import { useServiceOptionsData } from "../../hooks/useServiceApi";
import { useCreateServiceSale, useLookupServiceSale } from "../../hooks/useServiceSaleApi";
import { hasPermission } from "../../utils/access";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { deviceRows, piecesLeft, servicePrice } from "../../utils/serviceSale";

const EMPTY_FORM = { service: "", quantity: "1", discount: "", soldBy: "", note: "" };

// Sell a service (coverage, warranty...) for a device this branch sold: find its invoice by number or
// IMEI, pick the device, pick the service. The price comes from the device's selling price.
const CreateServiceSale = () => {
  const { user } = useAuth();

  // all states
  const [found, setFound] = useState(null); // { sale, devices }
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  // null = follow the total on the default method; a list once edited
  const [paymentLines, setPaymentLines] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  // call service sale api
  const lookup = useLookupServiceSale();
  const createServiceSale = useCreateServiceSale();
  const { data: services = [] } = useServiceOptionsData();
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const { data: staff = [] } = useSaleStaffData();
  // the latest sales, to start from without typing
  const { data: recent, isLoading: recentLoading } = useSalesData({ page: 1, limit: 6 }, "sale");

  const rows = found ? deviceRows(found.devices) : [];
  const row = rows.find((r) => r.key === picked) ?? null;
  const options = services.filter((s) => piecesLeft(row, s._id) > 0);
  const service = options.find((s) => s._id === form.service) ?? null;
  const left = piecesLeft(row, form.service);
  const quantity = row?.serial ? 1 : Number(form.quantity) || 0;

  const price = service ? servicePrice(row.device.unitPrice, service.pricePercent, quantity) : 0;
  const incentive = service ? servicePrice(row.device.unitPrice, service.incentivePercent, quantity) : 0;
  const discount = Number(form.discount) || 0;
  const total = roundTaka(Math.max(price - discount, 0));
  const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
  const lines = paymentLines ?? [{ ...newPaymentLine(), key: "auto", paymentMethod: defaultMethod?._id ?? "", amount: total ? String(total) : "" }];
  const paid = total > 0 ? paymentLinesTotal(lines) : 0;

  const reset = () => {
    setPicked("");
    setForm({ ...EMPTY_FORM, soldBy: user._id });
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
    setForm((prev) => ({ ...prev, service: "", quantity: "1" }));
    setPaymentLines(null);
  };

  const handleField = (name, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const filled = total > 0 ? lines.filter((line) => line.paymentMethod || Number(line.amount) > 0) : [];
    const problem =
      (!row && "Pick the device.") ||
      (!service && "Pick a service.") ||
      (!row.serial && (quantity < 1 || quantity > left) && `Enter 1 to ${left} pieces.`) ||
      (discount > price && "Discount can't be more than the service price.") ||
      (filled.length > 0 && paymentLinesError(filled, methods, { checkBalance: false })) ||
      (paid > total && "Paid amount can't be more than the total.") ||
      (paid < total && !found.sale.customer && "This device was sold to a walk-in customer, so the service must be paid in full.");
    if (problem) return setError(problem);

    try {
      const result = await createServiceSale.mutateAsync({
        sale: found.sale._id,
        product: String(row.device.product),
        serial: row.serial ?? "",
        quantity,
        service: service._id,
        soldBy: form.soldBy,
        discount,
        payments: toPaymentItems(filled.filter((line) => Number(line.amount) > 0)),
        note: form.note.trim(),
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
      <PageHeader title="Sell Service" subtitle="Find a sold device by its invoice or IMEI, then add a service like coverage or warranty" />

      <ReturnOrderSearch onSearch={handleSearch} searching={searching} placeholder="Invoice no. (INV-000001) or the sold phone's IMEI..." />

      {saved && (
        <Alert type="success">
          <span className="font-semibold">{saved.saleNo}</span>: {saved.serviceName} for {saved.productName}
          {saved.serial ? ` (${saved.serial})` : ""}, {formatTaka(saved.total)}
          {saved.dueAmount ? `, due ${formatTaka(saved.dueAmount)}` : ""}.{" "}
          <Link to={ROUTES.BRANCH_SERVICE_SALES} className="font-semibold underline">
            View service sales
          </Link>
        </Alert>
      )}
      <Alert>{error}</Alert>

      {!found && (
        <ServiceSaleGuide
          sales={recent?.data ?? []}
          salesLoading={recentLoading}
          services={services}
          onPick={handleSearch}
          canManageServices={isMainAdmin(user) && hasPermission(user, "service.view")}
        />
      )}

      {found && (
        <div className="grid items-start gap-4 xl:grid-cols-[3fr_2fr]">
          <ServiceDevicePicker
            sale={found.sale}
            rows={rows}
            picked={picked}
            onPick={handlePick}
            serviceNames={Object.fromEntries(services.map((s) => [s._id, s.name]))}
          />
          <ServiceSalePanel
            row={row}
            options={options}
            form={{ ...form, soldBy: form.soldBy || user._id }}
            onField={handleField}
            maths={{ price, incentive, total, paid }}
            left={left}
            lines={lines}
            onLines={setPaymentLines}
            methods={methods}
            staff={staff}
            onSubmit={handleSubmit}
            submitting={createServiceSale.isPending}
            walkIn={!found.sale.customer}
          />
        </div>
      )}
    </div>
  );
};

export default CreateServiceSale;
