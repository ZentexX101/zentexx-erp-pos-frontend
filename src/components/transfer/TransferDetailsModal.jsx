import { LuArrowRight, LuStickyNote } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import Modal from "../common/modals/Modal";

// One transfer: the route, every item with its IMEIs, the stock value moved, and the note.
// showCost: main admins see what the moved stock cost.
const TransferDetailsModal = ({ transfer, showCost, onClose }) => (
  <Modal
    isOpen={Boolean(transfer)}
    onClose={onClose}
    title={`Transfer ${transfer?.transferNo ?? ""}`}
    subtitle={transfer && `${formatDateTime(transfer.date)} · by ${transfer.createdBy?.name ?? "—"}`}
    size="lg"
  >
    {transfer && (
      <div className="space-y-5">
        <div className="flex items-center justify-center gap-4 rounded-lg bg-slate-50 p-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">From</p>
            <p className="font-semibold text-slate-900">{transfer.fromBranch?.name}</p>
          </div>
          <LuArrowRight className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          <div className="text-center">
            <p className="text-xs text-slate-500">To</p>
            <p className="font-semibold text-slate-900">{transfer.toBranch?.name}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 text-right font-semibold">Qty</th>
                {showCost && <th className="px-3 py-2 text-right font-semibold">Stock Value</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfer.items.map((item) => (
                <tr key={item.product} className="align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium uppercase text-slate-900">{item.name}</p>
                    {item.serials.length > 0 && <p className="break-all font-mono text-xs text-slate-500">{item.serials.join(", ")}</p>}
                  </td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  {showCost && <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(item.cost)}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">{transfer.totalQuantity}</td>
                {showCost && <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(transfer.totalCost)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>

        {transfer.note && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <LuStickyNote className="h-3.5 w-3.5" aria-hidden="true" />
              Note
            </p>
            <p className="whitespace-pre-line text-sm text-slate-800">{transfer.note}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default TransferDetailsModal;
