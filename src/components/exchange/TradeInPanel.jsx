import { LuPlus, LuSmartphone } from "react-icons/lu";
import { useBranch } from "../../hooks/useBranch";
import { useShopSettingsData } from "../../hooks/useSettingApi";
import { newTradeIn } from "../../utils/exchange";
import ExchangePanel from "./ExchangePanel";
import TradeInDevice from "./TradeInDevice";

// "Old Device Details": the customer's devices taken in, one row each. Each goes into stock at its exchange value.
// lines: see utils/exchange newTradeIn; onChange(updater) — a state setter (functional updates, so a slow IMEI lookup
// doesn't undo typing done meanwhile). customer: the exchange's customer (for the "sold to someone else" check).
const TradeInPanel = ({ lines, onChange, customer }) => {
  const { activeBranch } = useBranch();
  const { data: settings } = useShopSettingsData();
  const setLine = (key, patch) => onChange((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  return (
    <ExchangePanel
      icon={LuSmartphone}
      title="Old Device Details"
      bn="(পুরাতন ডিভাইস)"
      bodyClassName="space-y-3"
      aside={
        <button
          type="button"
          onClick={() => onChange((prev) => [...prev, newTradeIn()])}
          disabled={lines.length >= 20}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add device
        </button>
      }
    >

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
    </ExchangePanel>
  );
};

export default TradeInPanel;
