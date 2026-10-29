import { useStockSerialsData } from "../../hooks/useStockApi";
import { formatShortDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import Spinner from "../common/loaders/Spinner";
import Modal from "../common/modals/Modal";

// The IMEI pieces of one product in this branch's stock, oldest first
const StockSerialsModal = ({ stock, onClose }) => {
  const { data: units = [], isLoading } = useStockSerialsData(stock?.product?._id, undefined, { enabled: Boolean(stock) });

  return (
    <Modal
      isOpen={Boolean(stock)}
      onClose={onClose}
      title="IMEI / Serial List"
      subtitle={stock && `${stock.product.name} · ${units.length} in stock`}
      size="lg"
    >
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-5 w-5 text-indigo-600" />
        </div>
      ) : units.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No IMEI of this product is in stock.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">IMEI / Serial</th>
                <th className="px-3 py-2 font-semibold">Supplier</th>
                <th className="px-3 py-2 text-right font-semibold">Buying Price</th>
                <th className="px-3 py-2 font-semibold">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((unit, i) => (
                <tr key={unit._id}>
                  <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-900">{unit.serial}</td>
                  <td className="px-3 py-2 text-slate-600">{unit.supplier?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(unit.purchasePrice)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{formatShortDate(unit.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default StockSerialsModal;
