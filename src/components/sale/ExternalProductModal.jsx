import { useState } from "react";
import { LuStore, LuX } from "react-icons/lu";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useSupplierOptionsData } from "../../hooks/useSupplierApi";
import { externalCost, externalErrors, externalTotal, newExternal } from "../../utils/externalProduct";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput, toIntegerInput } from "../../utils/number";
import { formatPhone } from "../../utils/phone";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Modal from "../common/modals/Modal";

// Where it came from: an optional supplier. Picking one puts the buying price on their due.
const SourcePicker = ({ value, onChange }) => {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const { data: suppliers = [], isFetching } = useSupplierOptionsData(search);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/60 px-3 py-2.5 ring-1 ring-blue-100">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">{value.name}</span>
          <span className="block text-xs text-slate-500">The buying price is added to what we owe them</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove supplier"
          className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-red-600"
        >
          <LuX className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search supplier / shop by name or phone"
        aria-label="Search supplier"
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
      />
      {searchInput.trim() && (
        <ul className="mt-1.5 max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg ring-1 ring-slate-200">
          {suppliers.length === 0 && <li className="px-3 py-2.5 text-xs text-slate-500">{isFetching ? "Searching..." : "No supplier found."}</li>}
          {suppliers.map((supplier) => (
            <li key={supplier._id}>
              <button
                type="button"
                onClick={() => onChange({ _id: supplier._id, name: supplier.name })}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="truncate font-medium text-slate-800">{supplier.name}</span>
                <span className="shrink-0 text-xs text-slate-500">{formatPhone(supplier.phone)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-slate-500">A saved supplier: the buying price is added to what we owe them.</p>
    </div>
  );
};

// Add or edit a product we don't have in stock, brought in from another shop for this sale.
// line: the line to edit, or null to add one. onSave(line).
const ExternalProductModal = ({ line, onClose, onSave }) => {
  const [form, setForm] = useState(() => ({ ...newExternal(), ...line }));
  const [errors, setErrors] = useState({});
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const total = externalTotal(form);
  const profit = roundTaka(total - externalCost(form));
  const hasPrices = form.unitCost !== "" && form.unitPrice !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const problems = externalErrors(form);
    setErrors(problems);
    if (Object.keys(problems).length === 0) onSave(form);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={line ? "Edit external product" : "Sell an external product"}
      subtitle="A product we don't have, brought in from another shop for this customer"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="external-product" className="min-w-32">
            {line ? "Save" : "Add to cart"}
          </Button>
        </>
      }
    >
      <form id="external-product" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          <LuStore className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>It goes on the invoice like any product, but stock doesn't change. Profit = selling price − buying price.</p>
        </div>

        <Input
          label="Product name"
          required
          autoFocus
          maxLength={150}
          placeholder="e.g. iPhone 15 Pro 256GB Blue Titanium"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="IMEI / Product ID"
          maxLength={300}
          autoComplete="off"
          spellCheck={false}
          placeholder="Optional, prints on the invoice"
          value={form.productCode}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          onChange={(e) => set("productCode", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Quantity"
            required
            inputMode="numeric"
            value={form.quantity}
            onChange={(e) => set("quantity", toIntegerInput(e.target.value))}
            error={errors.quantity}
          />
          <Input
            label="Buying price (each)"
            required
            inputMode="decimal"
            placeholder="What it cost you"
            value={form.unitCost}
            onChange={(e) => set("unitCost", toDecimalInput(e.target.value))}
            error={errors.unitCost}
          />
          <Input
            label="Selling price (each)"
            required
            inputMode="decimal"
            placeholder="Customer pays"
            value={form.unitPrice}
            onChange={(e) => set("unitPrice", toDecimalInput(e.target.value))}
            error={errors.unitPrice}
          />
        </div>

        {hasPrices && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Line total</p>
              <p className="font-semibold text-slate-900">{formatTaka(total)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Profit</p>
              <p className={`font-semibold ${profit < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatTaka(profit)}</p>
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            Brought from <span className="text-red-500">*</span>
          </p>
          <SourcePicker
            value={form.supplier}
            onChange={(supplier) => {
              set("supplier", supplier);
              setErrors((prev) => ({ ...prev, source: "" }));
            }}
          />
          {!form.supplier && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="h-px flex-1 bg-slate-200" />
                or, not a saved supplier
                <span className="h-px flex-1 bg-slate-200" />
              </p>
              <Input
                aria-label="Shop name"
                maxLength={150}
                placeholder="Type the shop name, e.g. Rony Telecom, Station Road"
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">Only the name is kept; no due is recorded in the app.</p>
            </div>
          )}
          {errors.source && <p className="mt-1.5 text-sm text-red-600">{errors.source}</p>}
        </div>
      </form>
    </Modal>
  );
};

export default ExternalProductModal;
