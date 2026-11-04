import Input from "../common/forms/Input";
import PhoneInput from "../common/forms/PhoneInput";
import CustomerSelect from "./CustomerSelect";

// Who it's for: a walk-in's name and phone, or a saved customer
const CustomerChoice = ({ saved, onSaved, customer, onCustomer, name, onName, phone, onPhone }) => (
  <>
    <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Customer type">
      {[
        [false, "Walk-in"],
        [true, "Saved customer"],
      ].map(([value, label]) => (
        <button
          key={label}
          type="button"
          aria-pressed={saved === value}
          onClick={() => onSaved(value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${saved === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          {label}
        </button>
      ))}
    </div>
    {saved ? (
      <CustomerSelect value={customer} onChange={onCustomer} />
    ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" required maxLength={100} value={name} onChange={(e) => onName(e.target.value)} />
        <PhoneInput label="Phone" required value={phone} onChange={onPhone} />
      </div>
    )}
  </>
);

export default CustomerChoice;
