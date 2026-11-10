import { useId, useState } from "react";
import { LuArrowRight, LuPackage } from "react-icons/lu";
import { useBranchNamesData } from "../../hooks/useBranchApi";
import { useCreateTransfer } from "../../hooks/useTransferApi";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import TransferItems from "./TransferItems";

const lineCount = (line) => (line.stock.product.trackSerial ? line.serials.length : Number(line.quantity) || 0);

// First problem with the lines, or ""
const linesError = (lines) => {
  if (!lines.length) return "Add at least one product.";
  const empty = lines.find((line) => lineCount(line) < 1);
  if (empty) return empty.stock.product.trackSerial ? `Tick the IMEIs of "${empty.stock.product.name}".` : `Enter the quantity of "${empty.stock.product.name}".`;
  const tooMany = lines.find((line) => !line.stock.product.trackSerial && lineCount(line) > line.stock.quantity);
  return tooMany ? `Only ${tooMany.stock.quantity} of "${tooMany.stock.product.name}" in the sending branch.` : "";
};

// Move stock between branches. fixedFrom: the branch panel's own branch (the sender can't be changed);
// null in the main admin panel, where any two branches can be picked.
const TransferFormModal = ({ fixedFrom, onClose, onSaved }) => {
  const formId = useId();
  const [fromBranch, setFromBranch] = useState(fixedFrom?._id ?? "");
  const [toBranch, setToBranch] = useState("");
  const [lines, setLines] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const { data: branches = [] } = useBranchNamesData();
  const createTransfer = useCreateTransfer();

  const units = lines.reduce((sum, line) => sum + lineCount(line), 0);
  const options = branches.map((b) => ({ value: b._id, label: b.name }));

  // A new sender has other stock, so the picked items no longer apply
  const changeFrom = (value) => {
    setFromBranch(value);
    setLines([]);
    if (value === toBranch) setToBranch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = (!fromBranch && "Select the sending branch.") || (!toBranch && "Select the receiving branch.") || linesError(lines);
    if (problem) return setError(problem);

    try {
      const saved = await createTransfer.mutateAsync({
        fromBranch,
        toBranch,
        items: lines.map((line) =>
          line.stock.product.trackSerial ? { product: line.stock.product._id, serials: line.serials } : { product: line.stock.product._id, quantity: Number(line.quantity) }
        ),
        note: note.trim(),
      });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create Stock Transfer"
      subtitle="Move products and IMEIs between branches. The receiving branch gets them right away."
      size="xl"
      footer={
        <>
          <span className="w-full self-center text-sm text-slate-500 sm:mr-auto sm:w-auto">
            {units ? `${lines.length} product${lines.length === 1 ? "" : "s"} · ${units} pcs` : "Select products to begin transfer."}
          </span>
          <Button variant="secondary" onClick={onClose} disabled={createTransfer.isPending} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={createTransfer.isPending}
            disabled={!units}
            className="flex-1 whitespace-nowrap sm:min-w-40 sm:flex-none"
          >
            Create Transfer
            <LuArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <Alert>{error}</Alert>

        <div className="grid items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto_1fr] sm:p-4">
          {fixedFrom ? (
            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">From Branch</p>
              <p className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900">{fixedFrom.name}</p>
            </div>
          ) : (
            <Select
              label="From Branch"
              required
              placeholder="Select From Branch (Source)"
              options={options}
              value={fromBranch}
              onChange={(e) => changeFrom(e.target.value)}
            />
          )}
          <LuArrowRight className="mx-auto mb-2.5 hidden h-5 w-5 text-slate-400 sm:block" aria-hidden="true" />
          <Select
            label="To Branch"
            required
            placeholder="Select To Branch (Destination)"
            options={options.filter((option) => option.value !== fromBranch)}
            value={toBranch}
            onChange={(e) => {
              setError("");
              setToBranch(e.target.value);
            }}
          />
        </div>

        {fromBranch ? (
          <TransferItems
            key={fromBranch}
            fromBranch={fromBranch}
            lines={lines}
            onChange={(next) => {
              setError("");
              setLines(next);
            }}
          />
        ) : (
          <p className="flex items-start gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <LuPackage className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Select a <span className="font-semibold">From Branch</span> to see its stock and pick products to send.
            </span>
          </p>
        )}

        <Textarea
          label="Transfer Note / Reason (optional)"
          placeholder="Enter reason for transfer, recipient notes, or instructions..."
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
};

export default TransferFormModal;
