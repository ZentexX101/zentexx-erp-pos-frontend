import { LuInbox } from "react-icons/lu";
import Pagination from "../common/data/Pagination";
import Spinner from "../common/loaders/Spinner";
import NotificationItem from "./NotificationItem";

// A page of notifications in one card, with paging. linkOf(n) -> { to, onClick } | undefined; onOpen(n)
const NotificationList = ({ items, meta, isLoading, filtered, linkOf, onOpen, showBranch, onPageChange, onLimitChange }) => (
  <div className="space-y-4">
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-indigo-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <LuInbox className="size-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">{filtered ? "Nothing matches these filters" : "No notifications yet"}</p>
          <p className="text-xs text-slate-500">Stock, sales, payments and HR updates you can see will show here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((n) => (
            <li key={n._id}>
              <NotificationItem notification={n} link={linkOf(n)} onOpen={() => onOpen(n)} showBranch={showBranch} />
            </li>
          ))}
        </ul>
      )}
    </section>
    <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
  </div>
);

export default NotificationList;
