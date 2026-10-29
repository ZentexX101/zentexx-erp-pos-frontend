import { useState } from "react";
import { LuUserCheck } from "react-icons/lu";
import { useSaleStaffData } from "../../hooks/useSaleApi";
import { customerBalanceMeaning } from "../../utils/customer";
import Button from "../common/buttons/Button";
import Select from "../common/forms/Select";
import Icon from "../common/icons/Icon";
import CustomerBalance from "../customer/CustomerBalance";
import CustomerFormModal from "../customer/CustomerFormModal";
import CustomerSelect from "../customer/CustomerSelect";

// "Sold By" staff and the customer (search or create). No customer = walk-in, which must pay in full.
const PosCustomerPanel = ({ soldBy, onSoldBy, customer, onCustomer, canCreateCustomer }) => {
  const [creating, setCreating] = useState(false);
  const { data: staff = [] } = useSaleStaffData();

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

      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <CustomerSelect label="Customer (empty = walk-in)" value={customer} onChange={onCustomer} />
        </div>
        {canCreateCustomer && (
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Icon name="plus" />
            Create Customer
          </Button>
        )}
      </div>

      {customer && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
          Balance: <CustomerBalance amount={customer.balance} />{" "}
          <span className="text-xs text-slate-500">({customerBalanceMeaning(customer.balance)})</span>
        </p>
      )}

      {creating && (
        <CustomerFormModal
          customer={null}
          onClose={() => setCreating(false)}
          onSaved={(saved) => {
            setCreating(false);
            onCustomer(saved);
          }}
        />
      )}
    </section>
  );
};

export default PosCustomerPanel;
