import logo from "../../assets/decent-logo-dark.png";
import { BUSINESS_NAME } from "../../constants/app";
import { formatDateTime } from "../formatDate";

// A4 at 96 dpi
const PORTRAIT = { width: 794, height: 1123 };
const LANDSCAPE = { width: 1123, height: 794 };
const PAD = 36;
const FOOTER = 36;
const CELL_X = 5;
// Crisp on screen and paper. A very long file drops to a lower sharpness, so its size and time stay reasonable.
const SHARP = { scale: 3, quality: 0.92 };
const LONG_FILE = { scale: 2, quality: 0.85 };
const LONG_FILE_PAGES = 60;
// A text column wider than this can wrap, so it doesn't push a table into landscape
const WRAP_AT = 120;
// Longer than this takes minutes and a very large file, so it asks for one month before starting
const MAX_PAGES = 250;
const MAX_CELL = 300;
const FONT = `'Segoe UI', 'Noto Sans Bengali', 'Nirmala UI', system-ui, sans-serif`;
const COLOR = {
  ink: "#0f172a",
  text: "#1e293b",
  muted: "#475569",
  line: "#e2e8f0",
  hairline: "#eef2f6",
  soft: "#f8fafc",
  stripe: "#fbfcfe",
  danger: "#dc2626",
};
// Status pills, the same meanings as the badges on screen
const PILL = {
  green: { background: "#dcfce7", color: "#15803d" },
  amber: { background: "#fef3c7", color: "#b45309" },
  blue: { background: "#dbeafe", color: "#1d4ed8" },
  red: { background: "#fee2e2", color: "#b91c1c" },
  slate: { background: "#f1f5f9", color: "#475569" },
};
const PILL_TONE = {
  paid: "green",
  active: "green",
  delivered: "green",
  sold: "green",
  approved: "green",
  "back in stock": "green",
  "stock arrived": "amber",
  "ready to collect": "amber",
  "damaged, kept aside": "amber",
  pending: "amber",
  "not yet": "amber",
  "with salary": "amber",
  repairing: "blue",
  cancelled: "red",
  rejected: "red",
};
const PILL_X = 8;

// Small DOM helper: text is always set as text, so a name can never become markup
const el = (tag, style = {}, children = []) => {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
};

const NUMBER_COLUMN = { header: "#", money: true };

// Every cell as text, with the row number in front. A very long text is cut, so one row can never outgrow a page.
const clip = (text) => (text.length > MAX_CELL ? `${text.slice(0, MAX_CELL)}…` : text);
const toCells = (columns, rows) => rows.map((row, index) => [String(index + 1), ...columns.map((column) => clip(String(column.value(row) ?? "—")))]);

const isFixed = (column) => column.money || column.nowrap;

// How wide each column wants to be, measured in the weight it's drawn in
const naturalWidths = (columns, cells) => {
  const context = document.createElement("canvas").getContext("2d");
  const measure = (text, font) => {
    context.font = font;
    return Math.max(...text.split("\n").map((line) => context.measureText(line).width));
  };
  return columns.map((column, c) => {
    const font = `${column.strong || column.danger ? "600 " : ""}11px ${FONT}`;
    const widest = cells.reduce((max, row) => Math.max(max, measure(row[c], font)), 0);
    return Math.ceil(Math.max(widest + (column.badge ? PILL_X * 2 : 0), measure(column.header.toUpperCase(), `700 9.5px ${FONT}`) + 4)) + CELL_X * 2 + 3;
  });
};

// Portrait unless the table can't fit: one-line columns at full width, text columns allowed to wrap
const pageSizeFor = (columns, natural) => {
  const needed = columns.reduce((sum, column, c) => sum + (isFixed(column) ? natural[c] : Math.min(natural[c], WRAP_AT)), 0);
  return needed <= PORTRAIT.width - PAD * 2 ? PORTRAIT : LANDSCAPE;
};

// Column widths that stay the same on every page. Money and short values keep one line; text columns share what's left.
// squeezed: even this page can't hold them, so cells may wrap
const columnWidths = (columns, natural, tableWidth) => {
  const fixed = columns.reduce((sum, column, c) => sum + (isFixed(column) ? natural[c] : 0), 0);
  const minimum = (c) => Math.min(natural[c], 70);
  const flexible = columns.map((column, c) => (isFixed(column) ? null : c)).filter((c) => c !== null);
  const smallest = flexible.reduce((sum, c) => sum + minimum(c), 0);

  // Too much for the page, even at its smallest: everything shrinks together, and cells may wrap
  if (fixed + smallest > tableWidth) {
    const total = natural.reduce((sum, width) => sum + width, 0);
    return { widths: natural.map((width) => (width / total) * tableWidth), squeezed: true };
  }

  // Share the room by need, never wider than a column wants; what's left over goes to the widest text column
  const widths = natural.slice();
  let room = tableWidth - fixed;
  let open = flexible.slice();
  while (open.length) {
    const need = open.reduce((sum, c) => sum + natural[c], 0);
    const capped = open.filter((c) => natural[c] <= (room * natural[c]) / need);
    if (need <= room || !capped.length) {
      for (const c of open) widths[c] = Math.max(minimum(c), need <= room ? natural[c] : (room * natural[c]) / need);
      break;
    }
    for (const c of capped) {
      widths[c] = natural[c];
      room -= natural[c];
    }
    open = open.filter((c) => !capped.includes(c));
  }
  const used = widths.reduce((sum, width) => sum + width, 0);
  const spare = tableWidth - used;
  if (spare < 0) {
    const flexibleTotal = flexible.reduce((sum, c) => sum + widths[c], 0);
    for (const c of flexible) widths[c] += (spare * widths[c]) / flexibleTotal;
  } else if (spare > 0) {
    const target = flexible.length ? flexible.reduce((best, c) => (natural[c] > natural[best] ? c : best)) : widths.length - 1;
    widths[target] += spare;
  }
  return { widths, squeezed: false };
};

const cellStyle = (column) => ({
  padding: `7px ${CELL_X}px`,
  textAlign: column.money ? "right" : "left",
  overflowWrap: "anywhere",
  verticalAlign: "top",
});

const pill = (text) =>
  el(
    "span",
    {
      ...PILL[PILL_TONE[text.toLowerCase()] ?? "slate"],
      display: "inline-block",
      padding: `1px ${PILL_X}px`,
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },
    text,
  );

const cellContent = (column, text) => {
  if (column.badge && text !== "—") return pill(text);
  const [first, ...details] = text.split("\n");
  const main = column.strong ? { fontWeight: "600", color: COLOR.ink } : column.danger && first !== "—" ? { fontWeight: "600", color: COLOR.danger } : {};
  return [
    el("div", { ...main, ...(isFixed(column) && !column.wrap ? { whiteSpace: "nowrap" } : {}) }, first),
    ...details.map((line) => el("div", { fontSize: "10px", color: COLOR.muted }, line)),
  ];
};

const table = (columns, widths, cellRows, tableWidth) =>
  el("table", { width: `${tableWidth}px`, tableLayout: "fixed", borderCollapse: "collapse", fontSize: "11px", lineHeight: "1.4", color: COLOR.text }, [
    el(
      "colgroup",
      {},
      widths.map((width) => {
        const col = el("col");
        col.style.width = `${width}px`;
        return col;
      }),
    ),
    el(
      "thead",
      {},
      el(
        "tr",
        { background: COLOR.soft, borderBottom: "1.5px solid #cbd5e1" },
        columns.map((column) =>
          el(
            "th",
            { ...cellStyle(column), padding: `8px ${CELL_X}px`, fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.05em", color: COLOR.muted },
            column.header.toUpperCase(),
          ),
        ),
      ),
    ),
    el(
      "tbody",
      {},
      cellRows.map((cells, r) =>
        el(
          "tr",
          { borderBottom: `1px solid ${COLOR.hairline}`, background: r % 2 ? COLOR.stripe : "#ffffff" },
          cells.map((text, c) => el("td", { ...cellStyle(columns[c]), ...(c === 0 ? { color: COLOR.muted } : {}) }, cellContent(columns[c], text))),
        ),
      ),
    ),
  ]);

// The first page's top: logo and branch on the left, what this is on the right, then the totals
const firstHeader = ({ title, scope, periodLabel, notes, summary }) =>
  el("div", {}, [
    el(
      "div",
      {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "24px",
        paddingBottom: "14px",
        borderBottom: `1px solid ${COLOR.line}`,
      },
      [
        el("div", { minWidth: "0" }, [
          Object.assign(el("img", { height: "32px", width: "auto", display: "block" }), { src: logo, alt: "" }),
          el("div", { marginTop: "8px", fontSize: "11px", color: COLOR.muted }, BUSINESS_NAME),
          scope && el("div", { marginTop: "1px", fontSize: "12px", fontWeight: "600", color: COLOR.text, overflowWrap: "anywhere" }, scope),
        ]),
        el("div", { textAlign: "right", flexShrink: "0" }, [
          el("div", { fontSize: "22px", fontWeight: "700", letterSpacing: "-0.01em", color: COLOR.ink, lineHeight: "1.2" }, title),
          el(
            "div",
            { marginTop: "6px" },
            el("span", { ...PILL.blue, display: "inline-block", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "600" }, periodLabel),
          ),
        ]),
      ],
    ),
    notes.length > 0 &&
      el("div", { marginTop: "10px", fontSize: "11px", color: COLOR.muted, overflowWrap: "anywhere" }, [
        el("span", { fontWeight: "600", color: COLOR.text }, "Filtered by: "),
        notes.join(" · "),
      ]),
    summary.length > 0 &&
      el(
        "div",
        { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "14px" },
        summary.map(({ label, value }) =>
          el("div", { flex: "1 1 130px", padding: "10px 14px", borderRadius: "10px", background: COLOR.soft, border: `1px solid ${COLOR.hairline}` }, [
            el("div", { fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.05em", color: COLOR.muted }, label.toUpperCase()),
            el("div", { marginTop: "3px", fontSize: "15px", fontWeight: "700", color: COLOR.ink, overflowWrap: "anywhere" }, String(value)),
          ]),
        ),
      ),
    el("div", { height: "14px" }),
  ]);

const laterHeader = ({ title, periodLabel }) =>
  el(
    "div",
    { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", paddingBottom: "10px", fontSize: "11px", color: COLOR.muted },
    [el("span", { fontSize: "13px", fontWeight: "700", color: COLOR.ink }, title), el("span", { fontWeight: "600" }, periodLabel)],
  );

// A slim coloured line across the top of every page
const pageAccent = () =>
  el("div", { position: "absolute", left: "0", right: "0", top: "0", height: "5px", background: "linear-gradient(90deg, #0f172a, #2a78d6)" });

// Generated, then who it's from (the last page says it's the end and how many rows), then the page number
const pageFooter = (printedAt, number, total, rowCount) =>
  el(
    "div",
    {
      position: "absolute",
      left: `${PAD}px`,
      right: `${PAD}px`,
      bottom: "18px",
      paddingTop: "8px",
      borderTop: `1px solid ${COLOR.line}`,
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      fontSize: "10px",
      color: COLOR.muted,
    },
    [
      el("span", {}, `Generated ${printedAt}`),
      el("span", {}, number === total ? `End of report · ${rowCount.toLocaleString("en-IN")} ${rowCount === 1 ? "row" : "rows"}` : BUSINESS_NAME),
      el("span", { fontWeight: "600" }, `Page ${number} of ${total}`),
    ],
  );

// Splits the rows into pages, so a row is never cut in half and the table's heading repeats
const paginate = (rowHeights, { first, later, available }) => {
  const pages = [];
  let start = 0;
  let used = first;
  rowHeights.forEach((height, index) => {
    if (used + height > available && index > start) {
      pages.push([start, index]);
      start = index;
      used = later;
    }
    used += height;
  });
  pages.push([start, rowHeights.length]);
  return pages;
};

const toFileName = (name) =>
  `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;

// Builds an A4 PDF of a table and downloads it. columns: [{ header, value(row), money, nowrap, strong }]; rows: every row to include.
// Pages are drawn by the browser, so Bangla text and the taka sign always come out right.
// onProgress(0 to 1) reports how far it has got. The libraries load only when someone exports.
export const downloadTablePdf = async ({ title, fileName, scope, periodLabel, notes = [], columns, rows, summary = [], onProgress }) => {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);

  const baseColumns = [NUMBER_COLUMN, ...columns];
  const cells = toCells(columns, rows);
  const natural = naturalWidths(baseColumns, cells);
  const size = pageSizeFor(baseColumns, natural);
  const tableWidth = size.width - PAD * 2;
  const { widths, squeezed } = columnWidths(baseColumns, natural, tableWidth);
  const allColumns = squeezed ? baseColumns.map((column) => ({ ...column, wrap: true })) : baseColumns;
  const info = { title, scope, periodLabel, notes, summary };

  const host = el("div", { position: "fixed", left: "-30000px", top: "0", width: `${size.width}px`, fontFamily: FONT, background: "#fff" });
  document.body.append(host);
  try {
    // Measure at the final widths
    const sizer = table(allColumns, widths, cells, tableWidth);
    const top = firstHeader(info);
    const next = laterHeader(info);
    const box = el("div", { width: `${tableWidth}px` }, [top, next, sizer]);
    host.append(box);
    const image = top.querySelector("img");
    if (image && !image.complete) await new Promise((done) => image.addEventListener("load", done, { once: true }));
    await image?.decode().catch(() => {});
    const headRow = sizer.tHead.offsetHeight;
    const rowHeights = [...sizer.tBodies[0].rows].map((row) => row.getBoundingClientRect().height);
    const firstHeight = top.offsetHeight + headRow;
    const laterHeight = next.offsetHeight + headRow;
    box.remove();

    const pages = paginate(rowHeights, { first: firstHeight, later: laterHeight, available: size.height - PAD * 2 - FOOTER });
    if (pages.length > MAX_PAGES) throw new Error(`That would be ${pages.length} pages, too long for one file. Pick one month instead.`);
    const printedAt = formatDateTime(new Date());
    const landscape = size === LANDSCAPE;
    const pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({ title: `${title} - ${periodLabel}`, subject: `${rows.length} rows`, creator: BUSINESS_NAME });
    const { scale, quality } = pages.length > LONG_FILE_PAGES ? LONG_FILE : SHARP;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let index = 0; index < pages.length; index += 1) {
      const [from, to] = pages[index];
      const sheet = el(
        "div",
        {
          position: "relative",
          width: `${size.width}px`,
          height: `${size.height}px`,
          padding: `${PAD}px`,
          boxSizing: "border-box",
          background: "#fff",
          color: COLOR.text,
          overflow: "hidden",
        },
        [
          index === 0 ? firstHeader(info) : laterHeader(info),
          table(allColumns, widths, cells.slice(from, to), tableWidth),
          pageFooter(printedAt, index + 1, pages.length, rows.length),
          pageAccent(),
        ],
      );
      host.append(sheet);
      const canvas = await html2canvas(sheet, { scale, backgroundColor: "#ffffff", logging: false, useCORS: true });
      sheet.remove();
      if (index > 0) pdf.addPage("a4", landscape ? "landscape" : "portrait");
      pdf.addImage(canvas.toDataURL("image/jpeg", quality), "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      onProgress?.((index + 1) / pages.length);
      // Lets the screen update between pages
      await new Promise((done) => setTimeout(done));
    }
    pdf.save(toFileName(fileName));
  } finally {
    host.remove();
  }
};
