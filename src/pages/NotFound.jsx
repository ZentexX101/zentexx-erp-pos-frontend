import { LuArrowLeft, LuLayoutDashboard, LuLogIn, LuScanLine } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router";
import BarcodeSvg from "../components/barcode/BarcodeSvg";
import BrandLogo, { BusinessName } from "../components/common/brand/BrandLogo";
import { getHomePath, ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

// The red scan line sweeping over the label (still for people who prefer less motion)
const SCAN_CSS = `
@keyframes nf-scan { 0%, 100% { top: 8%; } 50% { top: 88%; } }
@keyframes nf-float { 0%, 100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-6px); } }
.nf-scan { animation: nf-scan 2.6s ease-in-out infinite; }
.nf-float { animation: nf-float 5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .nf-scan { animation: none; top: 48%; } .nf-float { animation: none; transform: rotate(-3deg); } }
`;

// 404: a barcode label that "doesn't scan". Logged in -> back to the dashboard; otherwise -> sign in.
const NotFound = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-50">
      <style>{SCAN_CSS}</style>

      {/* Soft dotted backdrop with a glow behind the label */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_#cbd5e1_1px,_transparent_1px)] opacity-60 [background-size:22px_22px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-3xl" aria-hidden="true" />

      <header className="relative px-6 py-5 sm:px-10">
        <Link to={user ? getHomePath(user) : ROUTES.HOME} className="inline-block" aria-label="Home">
          <BrandLogo size="md" />
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-12 lg:flex-row lg:justify-between lg:gap-16">
          {/* The label */}
          <div className="nf-float relative w-72 shrink-0 sm:w-80" aria-hidden="true">
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
              {/* The sticker's cut-out holes */}
              <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-slate-50 ring-1 ring-slate-200" />
              <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-slate-50 ring-1 ring-slate-200" />

              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>Price tag</span>
                <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-600">Not found</span>
              </div>
              <p className="mt-3 font-serif text-7xl font-black leading-none tracking-tight text-slate-950">404</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Page · out of stock</p>

              <div className="relative mt-5 h-20">
                <BarcodeSvg value="0004040000000" className="opacity-90" />
                <span className="nf-scan absolute -inset-x-3 h-0.5 rounded-full bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.6)]" />
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] tracking-[0.12em] text-slate-600">
                <span>0004040000000</span>
                <span className="font-sans text-sm font-bold tracking-normal text-slate-900">৳ —</span>
              </div>
            </div>
          </div>

          {/* The message */}
          <div className="max-w-md text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
              <LuScanLine className="size-3.5 text-red-500" aria-hidden="true" />
              Scan failed · Error 404
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">This page isn't on the shelf</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              We looked everywhere, but nothing matches this link. It may be old, mistyped, or the page has moved.
            </p>
            <p className="mt-4 inline-block max-w-full truncate rounded-lg bg-white px-3 py-1.5 font-mono text-xs text-slate-500 ring-1 ring-slate-200" title={pathname}>
              {pathname}
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start">
              {user ? (
                <Link
                  to={getHomePath(user)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <LuLayoutDashboard className="size-4" aria-hidden="true" />
                  Go to dashboard
                </Link>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <LuLogIn className="size-4" aria-hidden="true" />
                  Sign in
                </Link>
              )}
              {canGoBack && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50"
                >
                  <LuArrowLeft className="size-4" aria-hidden="true" />
                  Go back
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative px-6 pb-6 text-center text-xs text-slate-400">
        © {year} <BusinessName />
      </footer>
    </div>
  );
};

export default NotFound;
