import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import Button from "../common/buttons/Button";

// "Search by Order ID or IMEI" + Search button (Enter works too, so a scanner can be used)
const ReturnOrderSearch = ({ onSearch, searching }) => {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:p-5">
      <div className="relative flex-1 sm:max-w-xl">
        <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by Order ID (INV-000001) or IMEI..."
          aria-label="Order ID or IMEI"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-brand/10"
        />
      </div>
      <Button type="submit" loading={searching} className="min-w-28">
        Search
      </Button>
    </form>
  );
};

export default ReturnOrderSearch;
