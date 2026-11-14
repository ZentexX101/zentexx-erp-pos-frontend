import { LuPlus, LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput } from "../../utils/number";
import { paymentLinesTotal } from "../../utils/paymentLines";

// Narrow "method + amount" rows for the POS / exchange summaries, with "Split payment"
// (e.g. ৳50,000 = ৳10,000 Cash + ৳20,000 Bank + ৳10,000 bKash + ৳10,000 Nagad).
// lines: [{ key, paymentMethod, amount }]; onChange(next). title: e.g. "Payment Methods" / "Pay out through".
// total (optional): what should be paid. A new split line then picks the next free method and takes what's left,
// and a "left to split" bar shows how much is still unpaid.
// withTxnId: show an optional "Txn ID" box under every non-Cash line (only where the API saves it: POS and exchange).
const CompactPaymentRows = ({
  title,
  lines,
  onChange,
  methods,
  tone = "green",
  total,
  withTxnId = false,
}) => {
  const setLine = (key, field, value) =>
    onChange(
      lines.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    );
  const methodOf = (line) => methods.find((m) => m._id === line.paymentMethod);
  const methodName = (line) => methodOf(line)?.name ?? "";
  const needsTxnId = (line) => {
    const method = methodOf(line);
    return Boolean(method) && method.kind !== "cash";
  };
  const taken = (key) =>
    new Set(
      lines
        .filter((line) => line.key !== key)
        .map((line) => line.paymentMethod),
    );
  const amountTone =
    tone === "green"
      ? "border-green-300 bg-green-50 focus:ring-green-200"
      : "border-orange-300 bg-orange-50 focus:ring-orange-200";

  const hasTotal = typeof total === "number" && total > 0;
  const remaining = hasTotal ? roundTaka(total - paymentLinesTotal(lines)) : 0;

  const addLine = () => {
    const used = new Set(lines.map((line) => line.paymentMethod));
    const nextMethod = methods.find((m) => !used.has(m._id));
    onChange([
      ...lines,
      {
        key: crypto.randomUUID(),
        paymentMethod: nextMethod?._id ?? "",
        amount: remaining > 0 ? String(remaining) : "",
      },
    ]);
  };

  // Put what's left on this line (added to whatever it already has)
  const fillRest = (line) =>
    setLine(
      line.key,
      "amount",
      String(roundTaka((Number(line.amount) || 0) + remaining)),
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <button
          type="button"
          onClick={addLine}
          disabled={lines.length >= methods.length}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40"
        >
          <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Split payment
        </button>
      </div>
      {lines.map((line, index) => (
        <div key={line.key} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <select
              aria-label={`Payment method ${index + 1}`}
              value={line.paymentMethod}
              /* A Txn ID belongs to its method, so a new method starts without one */
              onChange={(e) =>
                onChange(
                  lines.map((l) =>
                    l.key === line.key
                      ? { ...l, paymentMethod: e.target.value, txnId: "" }
                      : l,
                  ),
                )
              }
              className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
            >
              <option value="">
                {methods.length
                  ? "Select payment method"
                  : "No active payment method"}
              </option>
              {methods
                .filter((m) => !taken(line.key).has(m._id))
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
            </select>
            <input
              inputMode="decimal"
              aria-label={`Amount ${index + 1}`}
              value={line.amount}
              onChange={(e) =>
                setLine(line.key, "amount", toDecimalInput(e.target.value))
              }
              onFocus={(e) => e.target.select()}
              placeholder={
                remaining > 0 && !line.amount ? String(remaining) : "0"
              }
              className={`h-10 w-28 rounded-lg border px-3 text-right text-sm font-semibold outline-none focus:ring-2 sm:w-32 ${amountTone}`}
            />
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onChange(lines.filter((l) => l.key !== line.key))
                }
                className="rounded p-1 text-slate-400 hover:text-red-600"
                aria-label={`Remove payment ${index + 1}`}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {/* Optional Txn ID for bKash / Nagad / Bank / Others (not Cash, not before a method is picked) */}
          {withTxnId && needsTxnId(line) && (
            <input
              aria-label={`Txn ID ${index + 1}`}
              value={line.txnId ?? ""}
              onChange={(e) =>
                setLine(line.key, "txnId", e.target.value.slice(0, 100))
              }
              placeholder={`${methodName(line)} Txn ID (optional)`}
              className={`h-8 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-2.5 font-mono text-xs outline-none placeholder:font-sans placeholder:text-slate-400 focus:border-slate-400 focus:bg-white`}
            />
          )}
        </div>
      ))}

      {/* Split in progress: how much is still to place, or how much too much was entered */}
      {hasTotal && lines.length > 1 && remaining !== 0 && (
        <div
          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
            remaining > 0
              ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100"
              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
          }`}
        >
          <span>
            {remaining > 0 ? (
              <>
                <span className="tabular-nums font-bold">
                  {formatTaka(remaining)}
                </span>{" "}
                left to split
              </>
            ) : (
              <>
                <span className="tabular-nums font-bold">
                  {formatTaka(-remaining)}
                </span>{" "}
                more than the total
              </>
            )}
          </span>
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => fillRest(lines[lines.length - 1])}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Add to last line
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactPaymentRows;
