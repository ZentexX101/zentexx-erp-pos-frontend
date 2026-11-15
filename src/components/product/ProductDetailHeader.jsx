import { LuArrowLeft, LuPackagePlus } from "react-icons/lu";
import { Link } from "react-router";
import { PRODUCT_STATUS } from "../../constants/product";
import { ROUTES } from "../../constants/routes";
import Button from "../common/buttons/Button";
import Badge from "../common/data/Badge";
import VariantChips from "./VariantChips";

// Back link, then the product card: image, name, category / brand, barcode, variant and status,
// with "Add Stock (Purchase)" (only an active product can be bought)
const ProductDetailHeader = ({ product, canAddStock, onAddStock }) => (
  <div className="space-y-3">
    <Link to={ROUTES.PRODUCTS} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
      <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to products
    </Link>

    {product && (
      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:p-5">
        {product.image ? (
          <img src={product.image.url} alt={product.name} className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />
        ) : (
          <span className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400 ring-1 ring-slate-200">
            No Image
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{product.name}</h1>
            <Badge tone={product.status === PRODUCT_STATUS.ACTIVE ? "green" : "slate"}>
              {product.status === PRODUCT_STATUS.ACTIVE ? "Active" : "Inactive"}
            </Badge>
            {product.trackSerial && <Badge tone="blue">IMEI tracked</Badge>}
          </div>
          <p className="text-sm text-slate-500">
            {[product.category?.name, product.brand?.name].filter(Boolean).join(" · ")}
            {product.barcode && <span className="ml-2 font-mono text-xs">{product.barcode}</span>}
          </p>
          <VariantChips variant={product.variant} />
        </div>
        {canAddStock && (
          <div className="shrink-0">
            <Button
              onClick={onAddStock}
              disabled={product.status !== PRODUCT_STATUS.ACTIVE}
              title={product.status !== PRODUCT_STATUS.ACTIVE ? "Make the product active to buy stock" : undefined}
              className="w-full sm:w-auto"
            >
              <LuPackagePlus className="size-4" aria-hidden="true" />
              Add Stock (Purchase)
            </Button>
          </div>
        )}
      </div>
    )}
  </div>
);

export default ProductDetailHeader;
