import { isValidPhoneNumber } from "libphonenumber-js/max";
import { useEffect, useState } from "react";
import { LuUserCheck, LuUserPlus, LuUserRound } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useExchangeCustomerData, useSaleStaffData } from "../../hooks/useSaleApi";
import { customerBalanceMeaning } from "../../utils/customer";
import { formatPhone } from "../../utils/phone";
import Input from "../common/forms/Input";
import PhoneInput from "../common/forms/PhoneInput";
import Select from "../common/forms/Select";
import Spinner from "../common/loaders/Spinner";
import CustomerBalance from "../customer/CustomerBalance";
import CustomerSelect from "../customer/CustomerSelect";

// "Sold By" staff and the customer, phone first. A known phone picks that customer; a new one asks for a
// name and the customer is made when the exchange is completed (draft: { phone, name }).
// "Search by name" switches to the normal customer search.
const ExchangeCustomerPanel = ({ soldBy, onSoldBy, customer, onCustomer, draft, onDraft }) => {
  const [byName, setByName] = useState(false);
  const { data: staff = [] } = useSaleStaffData();

  const phone = useDebouncedValue(draft.phone, 300);
  const fullPhone = Boolean(phone) && isValidPhoneNumber(phone);
  const { data: found, isFetching, error } = useExchangeCustomerData(phone, { enabled: fullPhone && !customer && !byName });

  // A known phone: that customer, no name needed
  useEffect(() => {
    if (found && !customer) {
      onCustomer(found);
      onDraft({ phone: "", name: "" });
    }
  }, [found, customer, onCustomer, onDraft]);

  const isNew = fullPhone && !isFetching && !error && found === null;

  const clearCustomer = () => {
    onCustomer(null);
    onDraft({ phone: "", name: "" });
  };

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <Select
        label={
          <span className="inline-flex items-center gap-1.5">
            <LuUserCheck className="h-4 w-4" aria-hidden="true" />
            বিক্রয় কর্মী / Staff (Sold By)
          </span>
        }
        placeholder="Me (logged-in user)"
        options={staff.map((member) => ({ value: member._id, label: member.name }))}
        value={soldBy}
        onChange={(e) => onSoldBy(e.target.value)}
      />

      {customer ? (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200" aria-hidden="true">
            <LuUserRound className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {customer.name}
              {customer.status === "inactive" && <span className="ml-2 text-xs font-medium text-amber-600">(inactive)</span>}
            </p>
            <p className="text-xs text-slate-500">{formatPhone(customer.phone)}</p>
            <p className="mt-0.5 text-xs">
              Balance: <CustomerBalance amount={customer.balance ?? 0} />{" "}
              <span className="text-slate-500">({customerBalanceMeaning(customer.balance ?? 0)})</span>
            </p>
          </div>
          <button type="button" onClick={clearCustomer} className="shrink-0 text-xs font-semibold text-indigo-600 hover:underline">
            Change
          </button>
        </div>
      ) : byName ? (
        <div className="space-y-1.5">
          <CustomerSelect label="Customer (required)" value={null} onChange={onCustomer} />
          <button type="button" onClick={() => setByName(false)} className="text-xs font-semibold text-indigo-600 hover:underline">
            Use phone number instead
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <PhoneInput label="Customer phone" required value={draft.phone} onChange={(value) => onDraft({ ...draft, phone: value })} />
            <div className="mt-1.5 flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                {isFetching ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Spinner className="h-3.5 w-3.5 text-indigo-600" /> Looking up...
                  </span>
                ) : error ? (
                  <span className="text-red-600">{error.message}</span>
                ) : isNew ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <LuUserPlus className="size-3.5" aria-hidden="true" /> New customer
                  </span>
                ) : (
                  "Type the number; a known customer is picked automatically."
                )}
              </span>
              <button type="button" onClick={() => setByName(true)} className="font-semibold text-indigo-600 hover:underline">
                Search by name
              </button>
            </div>
          </div>

          {isNew && (
            <div className="rounded-lg bg-emerald-50/60 p-3 ring-1 ring-emerald-100">
              <Input
                label="Customer name"
                required
                placeholder="Full name"
                value={draft.name}
                onChange={(e) => onDraft({ ...draft, name: e.target.value })}
              />
              <p className="mt-1.5 text-xs text-slate-600">Saved as a new customer (name + phone) when you complete the exchange.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ExchangeCustomerPanel;
