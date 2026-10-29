import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSupplierOptionsData } from "../../hooks/useSupplierApi";
import { formatPhone } from "../../utils/phone";
import Button from "../common/buttons/Button";
import SearchInput from "../common/forms/SearchInput";
import Icon from "../common/icons/Icon";
import Spinner from "../common/loaders/Spinner";
import SupplierBalance from "../supplier/SupplierBalance";
import SupplierFormModal from "../supplier/SupplierFormModal";
import PickerCard from "./PickerCard";

// Pick one supplier: search on the backend (name or phone), click a row. canCreate adds a
// "Create Supplier" button whose new supplier is picked right away.
const SupplierPicker = ({ selected, onSelect, canCreate = false }) => {
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
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{selected.name}</p>
            <p className="text-xs text-slate-600">
              {formatPhone(selected.phone)} · Balance <SupplierBalance amount={selected.balance} signed />
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-900"
            aria-label="Clear supplier"
          >
            <LuX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search supplier by name or phone" />

      <div className="mt-3 max-h-80 flex-1 overflow-y-auto rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-5 w-5 text-indigo-600" />
          </div>
        ) : suppliers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">{search ? `No supplier matches "${search}".` : "No active suppliers yet."}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {suppliers.map((supplier) => {
              const isSelected = selected?._id === supplier._id;
              return (
                <li key={supplier._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(supplier)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                      isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <LuCheck className="h-3 w-3" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{supplier.name}</span>
                      <span className="text-xs text-slate-500">{formatPhone(supplier.phone)}</span>
                    </span>
                    <SupplierBalance amount={supplier.balance} signed className="text-xs" />
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
