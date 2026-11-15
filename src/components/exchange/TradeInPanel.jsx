import { LuPlus, LuSmartphone } from "react-icons/lu";
import { useBranch } from "../../hooks/useBranch";
import { useShopSettingsData } from "../../hooks/useSettingApi";
import { newTradeIn } from "../../utils/exchange";
import TradeInDevice from "./TradeInDevice";

// "Old Device Details": the customer's devices taken in, one row each. Each goes into stock at its exchange value.
// lines: see utils/exchange newTradeIn; onChange(updater) — a state setter (functional updates, so a slow IMEI lookup
// doesn't undo typing done meanwhile). customer: the exchange's customer (for the "sold to someone else" check).
const TradeInPanel = ({ lines, onChange, customer }) => {
  const { activeBranch } = useBranch();
  const { data: settings } = useShopSettingsData();
  const setLine = (key, patch) => onChange((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <LuSmartphone className="h-4 w-4" aria-hidden="true" />
          Old Device Details <span className="text-xs font-normal text-indigo-500">(পুরাতন ডিভাইস)</span>
        </h2>
        <button
          type="button"
          onClick={() => onChange((prev) => [...prev, newTradeIn()])}
          disabled={lines.length >= 20}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40"
        >
          <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add another device
        </button>
      </div>

      {lines.map((line, index) => (
        <TradeInDevice
          key={line.key}
          index={index}
          line={line}
          onChange={(patch) => setLine(line.key, patch)}
          onRemove={lines.length > 1 ? () => onChange((prev) => prev.filter((l) => l.key !== line.key)) : null}
          customer={customer}
          hint={settings?.exchangeReturnHint}
          branchId={activeBranch?._id}
        />
      ))}
    </section>
  );
};

export default TradeInPanel;
