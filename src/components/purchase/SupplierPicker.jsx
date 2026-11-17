import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSupplierOptionsData } from "../../hooks/useSupplierApi";
import { getInitials } from "../../utils/initials";
import { formatPhone } from "../../utils/phone";
import Button from "../common/buttons/Button";
import SearchInput from "../common/forms/SearchInput";
import Icon from "../common/icons/Icon";
import Spinner from "../common/loaders/Spinner";
import SupplierBalance from "../supplier/SupplierBalance";
import SupplierFormModal from "../supplier/SupplierFormModal";
import PickerCard from "./PickerCard";

const Avatar = ({ name, active }) => (
  <span
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
      active ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
    }`}
  >
    {getInitials(name ?? "?")}
  </span>
);

// Pick one supplier: search on the backend (name or phone), click a row. canCreate adds a
// "Create Supplier" button whose new supplier is picked right away.
const SupplierPicker = ({ selected, onSelect, canCreate = false, step }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [creating, setCreating] = useState(false);
  const { data: suppliers = [], isLoading } = useSupplierOptionsData(search);

  const handleCreated = (supplier) => {
    setCreating(false);
    onSelect(supplier);
  };

  return (
    <PickerCard
      step={step}
      eyebrow="Supplier Selection"
      title="Select Supplier"
      actions={
        canCreate && (
          <Button onClick={() => setCreating(true)}>
            <Icon name="plus" />
            Create Supplier
          </Button>
        )
      }
    >
      {selected && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-2.5">
          <Avatar name={selected.name} active />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate font-semibold text-slate-900">
              {selected.name}
              <LuCheck className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
            </p>
            <p className="text-xs text-slate-600">
              {formatPhone(selected.phone)} · Balance <SupplierBalance amount={selected.balance} signed />
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-900"
            aria-label="Clear supplier"
          >
            <LuX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search supplier by name or phone" />

      <div className="mt-3 h-80 shrink-0 overflow-y-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-5 w-5 text-indigo-600" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
            {search ? `No supplier matches "${search}".` : "No active suppliers yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {suppliers.map((supplier) => {
              const isSelected = selected?._id === supplier._id;
              return (
                <li key={supplier._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(supplier)}
                    aria-pressed={isSelected}
                    className={`relative flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                      isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" aria-hidden="true" />}
                    <Avatar name={supplier.name} active={isSelected} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{supplier.name}</span>
                      <span className="text-xs text-slate-500">{formatPhone(supplier.phone)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Balance</span>
                      <SupplierBalance amount={supplier.balance} signed className="text-xs tabular-nums" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">Showing up to 20 matches. Type to narrow down.</p>

      {creating && <SupplierFormModal supplier={null} onClose={() => setCreating(false)} onSaved={handleCreated} />}
    </PickerCard>
  );
};

export default SupplierPicker;
