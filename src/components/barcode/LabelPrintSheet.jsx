import BarcodeLabel from "./BarcodeLabel";

// What actually prints (only on paper). Mounted just for the print, because its @page rule sets the paper size:
// - thermal: the page is one label, so the printer feeds one sticker per page
// - A4 sheet: labels laid out on the sticker grid, as many sheets as needed
// labels: expandLabels(items); size / settings: see utils/barcodeLabels
const LabelPrintSheet = ({ labels, size, settings }) => {
  const thermal = size.kind === "thermal";
  const perSheet = thermal ? 1 : size.columns * size.rows;
  const pageSize = thermal ? `${size.width}mm ${size.height}mm` : "A4";
  const sheets = [];
  for (let i = 0; i < labels.length; i += perSheet) sheets.push(labels.slice(i, i + perSheet));

  return (
    <div className="hidden print:block">
      {/* One string only: React doesn't render a <style> with several children */}
      <style>{`@media print { @page { size: ${pageSize}; margin: 0; } html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; } }`}</style>

      {thermal
        ? labels.map((label, i) => (
            <div key={`${label.key}-${label.n}`} style={{ breakAfter: i === labels.length - 1 ? "auto" : "page" }}>
              <BarcodeLabel item={label} size={size} settings={settings} />
            </div>
          ))
        : sheets.map((sheet, s) => (
            <div
              key={s}
              style={{
                width: "210mm",
                height: "297mm",
                paddingTop: `${size.top}mm`,
                paddingLeft: `${size.left}mm`,
                display: "grid",
                gridTemplateColumns: `repeat(${size.columns}, ${size.width}mm)`,
                gridAutoRows: `${size.height}mm`,
                columnGap: `${size.gapX}mm`,
                rowGap: `${size.gapY}mm`,
                alignContent: "start",
                breakAfter: s === sheets.length - 1 ? "auto" : "page",
                overflow: "hidden",
              }}
            >
              {sheet.map((label) => (
                <BarcodeLabel key={`${label.key}-${label.n}`} item={label} size={size} settings={settings} cutLines={settings.cutLines} />
              ))}
            </div>
          ))}
    </div>
  );
};

export default LabelPrintSheet;
