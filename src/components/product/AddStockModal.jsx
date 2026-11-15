import { LuBuilding2, LuChevronRight } from "react-icons/lu";
import { BRANCH_STATUS } from "../../constants/branch";
import Modal from "../common/modals/Modal";

// "Add Stock (Purchase)": stock is bought into one branch, so the main admin picks it first.
// branches: [{ _id, name, status, quantity }] from the product details; onPick(branch) enters it.
const AddStockModal = ({ isOpen, product, branches, onClose, onPick }) => {
  const active = branches.filter((b) => b.status !== BRANCH_STATUS.INACTIVE);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock (Purchase)" subtitle={product?.name} placement="center" size="md">
      <p className="mb-3 text-sm text-slate-600">
        Which branch is this stock for? You'll enter that branch and the purchase opens with this product added
        {product?.trackSerial ? ", ready for its IMEIs." : "."}
      </p>
      {active.length ? (
        <ul className="space-y-2">
          {active.map((branch) => (
            <li key={branch._id}>
              <button
                type="button"
                onClick={() => onPick(branch)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500" aria-hidden="true">
                  <LuBuilding2 className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{branch.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-slate-500">{branch.quantity.toLocaleString("en-IN")} pcs now</span>
                <LuChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">There's no active branch to add stock to.</p>
      )}
    </Modal>
  );
};

export default AddStockModal;
