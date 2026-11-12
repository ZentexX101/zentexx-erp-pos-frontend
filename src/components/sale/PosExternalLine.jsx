import { LuPencil, LuStore, LuTrash2 } from "react-icons/lu";
import { externalQuantity, externalTotal, sourceOf } from "../../utils/externalProduct";
import { formatTaka } from "../../utils/money";

// A product brought in from elsewhere for this sale (not in stock): edited in its modal. onEdit(), onRemove()
const PosExternalLine = ({ line, onEdit, onRemove }) => (
  <li className="bg-amber-50/40 px-4 py-3.5">
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold uppercase leading-snug text-slate-900 [overflow-wrap:anywhere]">{line.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
            <LuStore className="size-3" aria-hidden="true" />
            External
          </span>
          <span>Buy {formatTaka(Number(line.unitCost) || 0)}</span>
          {sourceOf(line) && <span className="[overflow-wrap:anywhere]">from {sourceOf(line)}</span>}
        </p>
        {line.productCode.trim() && <p className="mt-0.5 font-mono text-xs text-slate-500 [overflow-wrap:anywhere]">{line.productCode}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-slate-900">{formatTaka(externalTotal(line))}</p>
        <p className="text-[11px] tabular-nums text-slate-500">
          {externalQuantity(line)} × {formatTaka(Number(line.unitPrice) || 0)}
        </p>
      </div>
      <div className="-mr-1.5 flex shrink-0">
        <button type="button" onClick={onEdit} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${line.name}`}>
          <LuPencil className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${line.name}`}>
          <LuTrash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </li>
);

export default PosExternalLine;
