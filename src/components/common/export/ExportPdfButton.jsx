import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useLocation } from "react-router";
import { useBranch } from "../../../hooks/useBranch";
import { currentMonth, monthLabel } from "../../../utils/hr";
import MonthSwitcher from "../../hr/MonthSwitcher";
import Alert from "../alerts/Alert";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";

const PAGE_SIZE = 100;
// More than this is a very long file: asks for one month instead of freezing the browser
const MAX_ROWS = 5000;

const CHOICES = {
  range: [
    { value: "all", label: "All time" },
    { value: "this_month", label: "This month" },
    { value: "month", label: "Pick a month" },
  ],
  month: [
    { value: "this_month", label: "This month" },
    { value: "month", label: "Pick a month" },
  ],
};

// How filters kept from the page read on the PDF. Anything else (dates, paging, branch) isn't listed.
const FILTER_LABELS = {
  search: "Search",
  status: "Status",
  type: "Type",
  category: "Category",
  brand: "Brand",
  service: "Service",
  customer: "Customer",
  technician: "Technician",
  direction: "Direction",
  due: "Only with due",
  overdue: "Only late",
  left: "Who left",
};

const isId = (value) => /^[0-9a-f]{24}$/i.test(String(value));

const filterNotes = (params) =>
  Object.entries(params)
    .filter(([key, value]) => FILTER_LABELS[key] && value)
    .map(([key, value]) => (value === true || value === "true" || isId(value) ? FILTER_LABELS[key] : `${FILTER_LABELS[key]}: ${value}`));

const monthBounds = (month) => {
  const [year, number] = month.split("-").map(Number);
  return { from: `${month}-01`, to: `${month}-${String(new Date(year, number, 0).getDate()).padStart(2, "0")}` };
};

// Every matching row, page by page, through the same list the page itself shows
const fetchEveryRow = async (fetchRows, params, onProgress) => {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const { data, meta } = await fetchRows({ ...params, page, limit: PAGE_SIZE });
    if (meta?.total > MAX_ROWS) throw new Error(`That's ${meta.total.toLocaleString("en-IN")} rows, too many for one file. Pick one month instead.`);
    rows.push(...data);
    if (!meta || page >= meta.totalPages) return rows;
    onProgress(page / meta.totalPages);
  }
};

// Period choice inside the dialog
const PeriodChoice = ({ choices, choice, onChoice, month, onMonth }) => (
  <div className="space-y-3">
    <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Period">
      {choices.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={choice === item.value}
          onClick={() => onChoice(item.value)}
          className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition ${choice === item.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
    {choice === "month" && (
      <div className="flex justify-center">
        <MonthSwitcher month={month} onChange={onMonth} />
      </div>
    )}
  </div>
);

// "Export PDF" for any list. report: from constants/pdfReports. params: the filters on the page, which the file keeps.
// scope: who it covers, when it's not simply the branch being worked in. Nothing here touches the page's own list or state.
const ExportPdfButton = ({ report, params = {}, scope }) => {
  const { activeBranch } = useBranch();
  const inBranch = useLocation().pathname.startsWith("/branch");

  // all states
  const [open, setOpen] = useState(false);
  // All time by default (like the lists); month-only reports (e.g. salaries) start on this month
  const [choice, setChoice] = useState(report.period === "range" ? "all" : "this_month");
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState(null); // { label, percent } while working
  const [error, setError] = useState("");

  const choices = CHOICES[report.period];
  const picked = choice === "month" ? month : currentMonth();
  const periodLabel = !choices ? "Full list" : choice === "all" ? "All time" : monthLabel(picked);
  const periodParams = !choices ? {} : report.period === "month" ? { month: picked } : choice === "all" ? {} : monthBounds(picked);
  const notes = filterNotes(params);
  const working = Boolean(status);

  const close = () => {
    if (working) return;
    setOpen(false);
    setError("");
  };

  // A new period is a new question, so the old answer goes
  const changePeriod = (setter) => (value) => {
    setter(value);
    setError("");
  };

  const handleDownload = async () => {
    setError("");
    setStatus({ label: "Getting the data...", percent: 0 });
    try {
      const rows = await fetchEveryRow(report.fetch, { ...params, ...periodParams }, (share) =>
        setStatus({ label: "Getting the data...", percent: share * 40 }),
      );
      if (!rows.length) {
        setError(choices ? `Nothing to export for ${periodLabel}.` : "Nothing to export.");
        return;
      }
      setStatus({ label: "Making the PDF...", percent: 40 });
      const { downloadTablePdf } = await import("../../../utils/pdf/downloadTablePdf");
      await downloadTablePdf({
        title: report.title,
        fileName: choices ? `${report.title} ${periodLabel}` : report.title,
        scope: scope ?? (inBranch ? activeBranch?.name : "All branches"),
        periodLabel,
        notes,
        columns: report.columns,
        rows,
        summary: report.summary?.(rows) ?? [],
        onProgress: (share) => setStatus({ label: "Making the PDF...", percent: 40 + share * 60 }),
      });
      setOpen(false);
    } catch (err) {
      setError(err.message || "Couldn't make the PDF. Please try again.");
    } finally {
      setStatus(null);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <LuDownload className="size-4" aria-hidden="true" />
        Export PDF
      </Button>

      <Modal
        isOpen={open}
        onClose={close}
        placement="center"
        title={`Export ${report.title}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close} disabled={working}>
              Cancel
            </Button>
            <Button onClick={handleDownload} loading={working}>
              {!working && <LuDownload className="size-4" aria-hidden="true" />}
              Download PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {choices ? (
            <PeriodChoice choices={choices} choice={choice} onChoice={changePeriod(setChoice)} month={month} onMonth={changePeriod(setMonth)} />
          ) : (
            <p className="text-sm text-slate-600">Downloads the whole list.</p>
          )}
          {notes.length > 0 && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 [overflow-wrap:anywhere]">
              Filters kept from this page: <span className="font-medium text-slate-800">{notes.join(" · ")}</span>
            </p>
          )}
          <Alert>{error}</Alert>
          {working && (
            <div role="status">
              <p className="mb-1.5 text-sm text-slate-600">{status.label}</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${status.percent}%` }} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ExportPdfButton;
