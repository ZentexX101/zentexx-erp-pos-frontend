// Small product image, or "N/A" when the product has none
const ProductThumb = ({ product }) =>
  product?.image?.url ? (
    <img src={product.image.url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-medium text-slate-400">
      N/A
    </span>
  );

export default ProductThumb;
