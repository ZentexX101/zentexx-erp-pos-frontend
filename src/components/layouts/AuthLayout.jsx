import { Link, Outlet } from "react-router";
import { ROUTES } from "../../constants/routes";
import BrandLogo from "../common/brand/BrandLogo";

// Large screens: black brand panel on the left, form on the right.
// Smaller screens: black header with the form in a bottom sheet.
const AuthLayout = () => {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 lg:flex-row lg:bg-white">
      <aside className="hidden w-[42%] max-w-[620px] flex-col justify-between bg-neutral-950 px-14 py-12 lg:flex xl:px-16">
        <Link to={ROUTES.HOME} className="self-start">
          <BrandLogo tone="light" className="h-11" />
        </Link>

        <div>
          <p className="font-serif text-5xl leading-[1.05] text-white xl:text-6xl">
            Buy. Sell.
            <br />
            Exchange.
          </p>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-neutral-400">
            The back office behind every Decent counter — sales, stock and exchanges for all branches.
          </p>

          <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-neutral-500">
            <span>© {year} Decent Electronics & Exchange Center</span>
            <span>Staff portal</span>
          </div>
        </div>
      </aside>

      {/* Mobile / tablet header */}
      <header className="px-6 pb-12 pt-safe-9 lg:hidden">
        <Link to={ROUTES.HOME} className="mx-auto block w-fit">
          <BrandLogo tone="light" className="h-9" />
        </Link>
      </header>

      <main className="relative -mt-5 flex flex-1 flex-col rounded-t-3xl bg-white animate-slide-up lg:mt-0 lg:rounded-none lg:animate-fade-in">
        <div className="flex flex-1 justify-center px-6 pb-8 pt-9 sm:pt-12 lg:items-center lg:pb-24">
          <div className="w-full max-w-md lg:max-w-[360px]">
            <Outlet />
          </div>
        </div>

        <footer className="flex justify-center gap-1 px-6 pb-safe-5 text-xs text-neutral-400 lg:justify-end lg:pb-6">
          <span className="lg:hidden">© {year} Decent ·</span>
          <span>Powered by Zentexx ERP</span>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;
