// Explains the balance colours in the table (same note as the reference app)
const CustomerBalanceNote = () => (
  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
    <span className="font-semibold text-blue-700">Note: </span>
    <span className="font-semibold text-red-600">লাল (Red)</span> মানে কাস্টমার আপনাকে টাকা দিবে (আপনার পাওনা)।{" "}
    <span className="font-semibold text-green-600">সবুজ (Green)</span> মানে আপনি কাস্টমারকে টাকা দিবেন (কাস্টমারের পাওনা)।
  </div>
);

export default CustomerBalanceNote;
