import { LuArrowRight } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput, toIntegerInput } from "../../utils/number";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import PaymentMethodLines from "../payment/PaymentMethodLines";

// The swap for the picked piece: the new IMEI (only this product's pieces in stock, or a quantity), what's
// wrong with the old one, and an optional charge. A different model is an exchange, not a replacement.
const ReplacementPanel = ({ row, form, onField, lines, onLines, paid, methods, onSubmit, submitting, walkIn }) => {
  const { data: pieces = [], isLoading } = useStockSerialsData(row?.device.product, "", { enabled: Boolean(row?.serial) });
  const charge = Number(form.charge) || 0;
  const due = roundTaka(charge - paid);
  const noPiece = row?.serial && !isLoading && pieces.length === 0;

  if (!row)
    return (
      <section className="rounded-2xl bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
        Pick the faulty piece to start.
      </section>
    );

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
      {row.serial ? (
        <>
          <Select
            label="New piece"
            required
            placeholder={isLoading ? "Loading..." : noPiece ? "None in stock" : "Select the new IMEI"}
            options={pieces.map((piece) => ({ value: piece.serial, label: piece.serial }))}
            value={form.newSerial}
            onChange={(e) => onField("newSerial", e.target.value)}
            disabled={noPiece}
          />
          {noPiece && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No other {row.device.name} in this branch. Buy or transfer one first, or use Exchange for a different model.
            </p>
          )}
          {form.newSerial && (
            <p className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
              {row.serial}
              <LuArrowRight className="size-4 text-slate-400" aria-hidden="true" />
              <span className="font-semibold">{form.newSerial}</span>
            </p>
          )}
        </>
      ) : (
        <Input
          label={`Pieces to replace (up to ${row.device.quantity})`}
          inputMode="numeric"
          value={form.quantity}
          onChange={(e) => onField("quantity", toIntegerInput(e.target.value))}
        />
      )}

      <Input
        label="What's wrong with it?"
        required
        maxLength={300}
        placeholder="Screen dead, not charging..."
        value={form.reason}
        onChange={(e) => onField("reason", e.target.value)}
      />

      <Input
        label="Charge to the customer"
        inputMode="decimal"
        placeholder="0 for a free replacement"
        value={form.charge}
        onChange={(e) => onField("charge", toDecimalInput(e.target.value))}
      />

      {charge > 0 && (
        <PaymentMethodLines lines={lines} onChange={onLines} methods={methods} title="Payment" addLabel="Add Method" totalLabel="Paid" tone="text-green-600" />
      )}
      {charge > 0 && (
        <p className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${due > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          <span>{due > 0 ? (walkIn ? "Walk-in: must be paid in full" : "Due (on the customer)") : "Fully paid"}</span>
          <span className="font-bold tabular-nums">{formatTaka(Math.max(due, 0))}</span>
        </p>
      )}

      <p className="text-xs leading-relaxed text-slate-500">
        The faulty piece is kept aside as damaged and can't be sold. From the Replacement List you can put it back in stock once it's fixed.
      </p>

      <Button onClick={onSubmit} loading={submitting} className="w-full py-3 text-base">
        Complete Replacement
      </Button>
    </section>
  );
};

export default ReplacementPanel;
