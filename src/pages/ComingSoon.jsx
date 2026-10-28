import { LuHammer } from "react-icons/lu";
import PageHeader from "../components/common/layout/PageHeader";

// Placeholder for menu pages whose module isn't built yet
const ComingSoon = ({ title }) => (
  <div>
    <PageHeader title={title} />
    <div className="mt-6 flex flex-col items-center justify-center rounded-xl bg-white px-6 py-20 text-center shadow-sm ring-1 ring-slate-200">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <LuHammer className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">Coming soon</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">This page is part of a module that hasn't been built yet.</p>
    </div>
  </div>
);

export default ComingSoon;
