import { LuArrowRight, LuConciergeBell, LuReceipt, LuSearch, LuSmartphone, LuWallet } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";

const STEPS = [
  { icon: LuSearch, title: "Find the invoice", text: "Type the invoice no. or the phone's IMEI, or pick a recent sale below." },
  { icon: LuSmartphone, title: "Pick the device", text: "Choose the IMEI (or item) the customer bought." },
  { icon: LuWallet, title: "Add the service & pay", text: "Price comes from the device's selling price × the service %." },
];

// Shown before an invoice is found: how it works, the latest sales of this branch to start from
// (onPick searches that invoice) and which services can be sold. sales: recent POS / exchange orders.
const ServiceSaleGuide = ({ sales, salesLoading, services, onPick, canManageServices }) => (
  <div className="grid items-start gap-4 xl:grid-cols-[3fr_2fr]">
    <div className="space-y-4">
      {/* How it works */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
        <h2 className="font-semibold text-slate-900">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-300">0{index + 1}</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                <step.icon className="size-4" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recent sales to start from */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Recent sales</h2>
          <span className="text-xs text-slate-500">Click one to add a service</span>
        </div>
        {salesLoading ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No sale in this branch yet. Sell a device from Create POS first.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {sales.map((sale) => (
              <li key={sale._id}>
                <button
                  type="button"
                  onClick={() => onPick(sale.invoiceNo)}
                  className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500" aria-hidden="true">
                    <LuReceipt className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      <span className="font-mono">{sale.invoiceNo}</span> · {sale.customer?.name ?? "Walk-in"}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {sale.items.map((item) => item.name).join(", ") || "—"} · {formatDateTime(sale.date)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">{formatTaka(sale.grandTotal)}</span>
                  <LuArrowRight
                    className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>

    {/* Services that can be sold */}
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <LuConciergeBell className="size-4 text-slate-500" aria-hidden="true" />
        Services you can sell
      </h2>
      {services.length === 0 ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-4 text-sm text-amber-800">
          No active service yet.{" "}
          {canManageServices ? (
            <Link to={ROUTES.SERVICES} className="font-semibold underline">
              Add one in Services
            </Link>
          ) : (
            "Ask an admin to add one in Services."
          )}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {services.map((service) => (
            <li key={service._id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 truncate text-sm font-medium text-slate-800" title={service.name}>
                {service.name}
              </span>
              <span className="flex shrink-0 gap-1.5 text-xs">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{service.pricePercent}% price</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">{service.incentivePercent}% incentive</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Example: a phone sold at ৳40,000 with a 10% service costs ৳4,000. Each IMEI can get each service once.
      </p>
    </section>
  </div>
);

export default ServiceSaleGuide;
