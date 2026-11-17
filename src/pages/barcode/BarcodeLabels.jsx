import { useCallback, useState } from "react";
import LabelItemsCard from "../../components/barcode/LabelItemsCard";
import LabelPrintSheet from "../../components/barcode/LabelPrintSheet";
import LabelSettingsCard from "../../components/barcode/LabelSettingsCard";
import Alert from "../../components/common/alerts/Alert";
import PageHeader from "../../components/common/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePrintWhenReady } from "../../hooks/usePrintWhenReady";
import { useGenerateBarcodes } from "../../hooks/useProductApi";
import { useFetchFullStock, useStockData } from "../../hooks/useStockApi";
import { hasPermission } from "../../utils/access";
import { MAX_COPIES, MAX_LABELS, expandLabels, labelSize, loadLabelSettings, saveLabelSettings } from "../../utils/barcodeLabels";

// A stock row -> a label row (as many labels as pieces on the shelf, at least one)
const toItem = (stock) => ({
  key: stock.product._id,
  product: stock.product,
  price: stock.salePrice,
  quantity: stock.quantity,
  copies: String(Math.min(Math.max(stock.quantity, 1), MAX_COPIES)),
});

// Barcode Labels: pick products (covers, glass… sold by barcode), give the ones without a barcode our own
// code, and print stickers on a thermal label printer or an A4 sticker sheet. Scanning a sticker at the POS adds the product.
const BarcodeLabels = () => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();

  // all states
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [settings, setSettings] = useState(loadLabelSettings);
  const [error, setError] = useState("");
  const [addingAll, setAddingAll] = useState(false);
  const [printLabels, setPrintLabels] = useState(null);

  // call stock / product api
  const { data: searchData, isFetching: searching } = useStockData({ search, page: 1, limit: 20 });
  const fetchFullStock = useFetchFullStock();
  const generateBarcodes = useGenerateBarcodes();
  usePrintWhenReady(printLabels, useCallback(() => setPrintLabels(null), []));

  const size = labelSize(settings.size);
  const totalLabels = items.reduce((sum, item) => sum + (Number(item.copies) || 0), 0);
  const missingPrinted = items.some((item) => !item.product.barcode && Number(item.copies) > 0);
  const printBlocked = missingPrinted
    ? "Generate barcodes for the products without one first."
    : totalLabels > MAX_LABELS
      ? `At most ${MAX_LABELS} labels in one print. Lower the counts and print in parts.`
      : "";

  const changeSettings = (patch) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveLabelSettings(next);
      return next;
    });

  // New products go to the top; a product already in the list stays as it is
  const addStocks = (stocks) => {
    setError("");
    setItems((prev) => {
      const have = new Set(prev.map((item) => item.key));
      return [...stocks.filter((stock) => !have.has(stock.product._id)).map(toItem), ...prev];
    });
  };

  // Enter / a scanner in the search box: the product with exactly that barcode (or the only match)
  const handleEnter = async (text) => {
    try {
      const { data: rows = [] } = await fetchFullStock({ search: text });
      const match = rows.find((row) => row.product.barcode?.toLowerCase() === text.toLowerCase()) ?? (rows.length === 1 ? rows[0] : null);
      if (!match) {
        setError(`No product in this branch's stock matches "${text}".`);
        return false;
      }
      addStocks([match]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Everything on the shelf here, except mobiles (they're sold by IMEI)
  const handleAddAll = async () => {
    setAddingAll(true);
    try {
      const { data: rows = [] } = await fetchFullStock({ quantity: "in_stock" });
      const stocks = rows.filter((row) => !row.product.trackSerial);
      if (!stocks.length) setError("Nothing without IMEI is in stock in this branch.");
      else addStocks(stocks);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingAll(false);
    }
  };

  const handleGenerate = async (productIds) => {
    setError("");
    try {
      const result = await generateBarcodes.mutateAsync(productIds);
      const codes = new Map(result.products.map((p) => [String(p._id), p.barcode]));
      setItems((prev) =>
        prev.map((item) => (codes.has(item.key) ? { ...item, product: { ...item.product, barcode: codes.get(item.key) } } : item)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrint = () => {
    if (printBlocked || !totalLabels) return;
    setPrintLabels(expandLabels(items.filter((item) => item.product.barcode)));
  };

  return (
    <div>
      <div className="space-y-4 print:hidden">
        <PageHeader
          title="Barcode Labels"
          subtitle={`Print barcode stickers for products in ${activeBranch?.name ?? "this branch"}. Scan a sticker at the POS to sell it.`}
        />

        <Alert>{error}</Alert>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-start">
          <LabelItemsCard
            items={items}
            searchInput={searchInput}
            onSearchInput={setSearchInput}
            searchRows={searchData?.data ?? []}
            searching={searching}
            onPick={(stock) => addStocks([stock])}
            onEnter={handleEnter}
            onAddAll={handleAddAll}
            addingAll={addingAll}
            onCopies={(key, copies) => setItems((prev) => prev.map((item) => (item.key === key ? { ...item, copies } : item)))}
            onRemove={(key) => setItems((prev) => prev.filter((item) => item.key !== key))}
            onClear={() => setItems([])}
            onGenerate={handleGenerate}
            generating={generateBarcodes.isPending}
            canGenerate={hasPermission(user, "product.edit")}
          />
          <div className="xl:sticky xl:top-0">
            <LabelSettingsCard
              settings={settings}
              onChange={changeSettings}
              size={size}
              previewItem={items.find((item) => item.product.barcode)}
              totalLabels={totalLabels}
              onPrint={handlePrint}
              printBlocked={printBlocked}
            />
          </div>
        </div>
      </div>

      {printLabels && <LabelPrintSheet labels={printLabels} size={size} settings={settings} />}
    </div>
  );
};

export default BarcodeLabels;
