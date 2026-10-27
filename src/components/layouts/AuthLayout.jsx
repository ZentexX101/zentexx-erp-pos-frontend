import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            Z
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Zentexx ERP</h1>
          <p className="text-sm text-slate-500">POS & Inventory Management</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
