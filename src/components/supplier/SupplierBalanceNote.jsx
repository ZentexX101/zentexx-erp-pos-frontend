// Explains the balance colours in the table (same note as the reference app)
const SupplierBalanceNote = () => (
  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
    <span className="font-semibold text-blue-700">Note: </span>
    <span className="font-semibold text-green-600">সবুজ (Green)</span> মানে আপনি সাপ্লায়ারকে টাকা দিবেন (সাপ্লায়ারের পাওনা)।{" "}
    <span className="font-semibold text-red-600">লাল (Red)</span> মানে সাপ্লায়ার আপনাকে টাকা দিবে (আপনার পাওনা)।
  </div>
);

export default SupplierBalanceNote;
