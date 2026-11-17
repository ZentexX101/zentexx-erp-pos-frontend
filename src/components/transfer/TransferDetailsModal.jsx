import { LuArrowRight, LuStickyNote, LuStore } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { getInitials } from "../../utils/initials";
import { formatTaka } from "../../utils/money";
import Modal from "../common/modals/Modal";
import VariantChips from "../product/VariantChips";
import DirectionBadge from "./DirectionBadge";

// One end of the route: label, branch name, and a "This branch" tag on the panel's own side
const RouteEnd = ({ label, branch, own, align = "left" }) => (
  <div className={`flex min-w-0 flex-1 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
      <LuStore className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="break-words font-semibold text-slate-900">{branch?.name ?? "—"}</p>
      {own && branch?._id === own && <p className="text-[11px] font-medium text-indigo-600">This branch</p>}
    </div>
  </div>
);

const Stat = ({ label, children }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">{children}</p>
  </div>
);

// One transfer: the route, every item with its IMEIs, the stock value moved, and the note.
// showCost: main admins see what the moved stock cost. ownBranch (branch panel): marks Sent / Received.
const TransferDetailsModal = ({ transfer, showCost, ownBranch, onClose }) => (
  <Modal
    isOpen={Boolean(transfer)}
    onClose={onClose}
    title={
      transfer && (
        <span className="flex flex-wrap items-center gap-2">
          Transfer <span className="font-mono">{transfer.transferNo}</span>
          {ownBranch && <DirectionBadge sent={transfer.fromBranch?._id === ownBranch} />}
        </span>
      )
    }
    subtitle={
      transfer && (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{formatDateTime(transfer.date)}</span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
              {getInitials(transfer.createdBy?.name ?? "?")}
            </span>
            {transfer.createdBy?.name ?? "—"}
          </span>
        </span>
      )
    }
    size="lg"
  >
    {transfer && (
      <div className="space-y-5">
        {/* Route */}
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 via-indigo-50/60 to-slate-50 p-4 ring-1 ring-slate-200 sm:gap-4">
          <RouteEnd label="From" branch={transfer.fromBranch} own={ownBranch} />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
            <LuArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
          <RouteEnd label="To" branch={transfer.toBranch} own={ownBranch} align="right" />
        </div>

        {/* Totals */}
        <div className={`grid gap-3 ${showCost ? "grid-cols-3" : "grid-cols-2"}`}>
          <Stat label="Products">{transfer.items.length}</Stat>
          <Stat label="Quantity">
            {transfer.totalQuantity} <span className="text-xs font-medium text-slate-500">pcs</span>
          </Stat>
          {showCost && <Stat label="Stock Value">{formatTaka(transfer.totalCost)}</Stat>}
        </div>

        {/* Items */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Items</h3>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {transfer.items.map((item) => (
              <li key={item.product} className="space-y-2.5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-semibold uppercase text-slate-900">{item.name}</p>
                    <VariantChips variant={item.variant} />
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white">
                      {item.quantity} pcs
                    </span>
                    {showCost && (
                      <>
                        <p className="mt-1.5 whitespace-nowrap text-sm font-semibold text-slate-900">{formatTaka(item.cost)}</p>
                        {item.quantity > 1 && (
                          <p className="whitespace-nowrap text-[11px] text-slate-500">{formatTaka(item.cost / item.quantity)} each</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {item.serials.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      IMEI <span className="text-slate-400">({item.serials.length})</span>
                    </p>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {item.serials.map((serial, i) => (
                        <li
                          key={serial}
                          className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700 ring-1 ring-inset ring-slate-200"
                        >
                          <span className="w-4 shrink-0 text-right text-[10px] text-slate-400">{i + 1}</span>
                          <span className="break-all">{serial}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.productCode && (
                  <p className="text-xs text-slate-600">
                    <span className="font-medium uppercase tracking-wide text-slate-500">Product ID</span>{" "}
                    <span className="ml-1 break-all rounded bg-slate-50 px-1.5 py-0.5 font-mono text-slate-800 ring-1 ring-inset ring-slate-200">
                      {item.productCode}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {transfer.note && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
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
