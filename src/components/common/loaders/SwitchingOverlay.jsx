import { LuMoveDiagonal } from "react-icons/lu";

// Full-screen loader while "Login as" switches accounts (and back), in the app's light + brand theme.
// title / subtitle describe the switch.
const SwitchingOverlay = ({ title, subtitle = "Loading account data..." }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-[radial-gradient(ellipse_at_center,#ffffff_0%,var(--color-slate-50)_55%,var(--color-slate-100)_100%)] px-4"
  >
    <div className="flex flex-col items-center text-center">
      <div className="relative flex size-28 items-center justify-center">
        {/* soft shadow halo */}
        <span className="absolute inset-0 rounded-full bg-brand/5 blur-xl" aria-hidden="true" />
        {/* outer ring */}
        <span className="absolute inset-0 rounded-full border-2 border-slate-200 bg-white shadow-sm" aria-hidden="true" />
        {/* spinning arc */}
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand border-r-brand/30 [animation-duration:1.1s]"
          aria-hidden="true"
        />
        {/* centre */}
        <span className="relative flex size-14 items-center justify-center rounded-full bg-brand shadow-lg shadow-slate-900/20">
          <LuMoveDiagonal className="size-6 animate-switch-pulse text-white" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-8 text-xl font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

      <div className="mt-6 h-1 w-52 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full w-1/3 animate-switch-progress rounded-full bg-brand" />
      </div>
    </div>
  </div>
);

export default SwitchingOverlay;
