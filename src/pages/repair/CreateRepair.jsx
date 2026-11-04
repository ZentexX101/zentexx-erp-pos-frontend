import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import PhoneInput from "../../components/common/forms/PhoneInput";
import PageHeader from "../../components/common/layout/PageHeader";
import CustomerSelect from "../../components/customer/CustomerSelect";
import PaymentMethodLines from "../../components/payment/PaymentMethodLines";
import RepairDeviceNote from "../../components/repair/RepairDeviceNote";
import { JobSection, RepairDeviceFields, RepairPromiseFields, RepairTechnicianFields } from "../../components/repair/RepairJobFields";
import { repairDetailPath } from "../../constants/routes";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { useCreateRepair, useRepairDevice, useRepairOptions } from "../../hooks/useRepairApi";
import { formatTaka } from "../../utils/money";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import { toE164, validateBdMobile } from "../../utils/phone";
import { roundTaka } from "../../utils/number";
import { jobFormError, toJobPayload } from "../../utils/repair";

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  deviceName: "",
  imei: "",
  color: "",
  accessories: [],
  problem: "",
  condition: "",
  technicianType: "staff",
  technician: "",
  outsideName: "",
  estimate: "",
  promisedDate: "",
};

// Book a device in: who brought it, what it is and what's wrong, who fixes it, and any advance
const CreateRepair = () => {
  const navigate = useNavigate();

  // all states
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false); // a saved customer, rather than a walk-in
  const [customer, setCustomer] = useState(null);
  const [lines, setLines] = useState(() => [newPaymentLine()]);
  const [error, setError] = useState("");

  // call repair api
  const create = useCreateRepair();
  const { data: options } = useRepairOptions();
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const imei = useDebouncedValue(form.imei.trim().toUpperCase());
  const { data: history } = useRepairDevice(imei.length >= 5 ? imei : "");

  const advance = paymentLinesTotal(lines);
  const estimate = Number(form.estimate) || 0;

  const handleField = (name, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseSale = (sale) => {
    if (sale.deviceName) handleField("deviceName", sale.deviceName);
    if (sale.customer) {
      setSaved(true);
      setCustomer(sale.customer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = lines.filter((line) => line.paymentMethod || line.amount);
    const problem =
      (saved && !customer && "Pick the customer.") ||
      (!saved && !form.customerName.trim() && "Enter the customer's name.") ||
      (!saved && validateBdMobile(form.customerPhone)) ||
      jobFormError(form) ||
      (filled.length > 0 && paymentLinesError(filled, methods, { checkBalance: false }));
    if (problem) return setError(problem);

    try {
      const job = await create.mutateAsync({
        ...toJobPayload(form),
        customer: saved ? customer._id : "",
        customerName: saved ? "" : form.customerName.trim(),
        customerPhone: saved ? "" : toE164(form.customerPhone),
        payments: toPaymentItems(filled),
      });
      navigate(repairDetailPath(job._id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader title="New Repair" subtitle="Book a device in. You can print the customer's slip on the next page." />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5">
          <JobSection title="Customer">
            <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Customer type">
              {[
                [false, "Walk-in"],
                [true, "Saved customer"],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={saved === value}
                  onClick={() => setSaved(value)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${saved === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {saved ? (
              <CustomerSelect value={customer} onChange={setCustomer} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Name" required maxLength={100} value={form.customerName} onChange={(e) => handleField("customerName", e.target.value)} />
                <PhoneInput label="Phone" required value={form.customerPhone} onChange={(value) => handleField("customerPhone", value)} />
              </div>
            )}
          </JobSection>

          <JobSection title="Device">
            <RepairDeviceFields form={form} onField={handleField} imeiNote={<RepairDeviceNote history={history} onUseSale={handleUseSale} />} />
          </JobSection>
        </div>

        <div className="min-w-0 space-y-5 xl:sticky xl:top-20">
          <JobSection title="Technician">
            <RepairTechnicianFields form={form} onField={handleField} staff={options?.staff ?? []} />
          </JobSection>

          <JobSection title="Estimate and advance" hint="The final charge is set when the device is delivered.">
            <RepairPromiseFields form={form} onField={handleField} />
            <PaymentMethodLines lines={lines} onChange={setLines} methods={methods} title="Advance" addLabel="Add" totalLabel="Advance" tone="text-green-600" />
            {estimate > 0 && (
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Left to pay on the estimate
                <span className="font-semibold text-slate-900">{formatTaka(Math.max(roundTaka(estimate - advance), 0))}</span>
              </p>
            )}
          </JobSection>

          <Alert>{error}</Alert>
          <Button type="submit" loading={create.isPending} className="w-full rounded-xl py-3">
            Book it in
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreateRepair;
