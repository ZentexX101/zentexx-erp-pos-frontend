import { SETTINGS_TABS } from "../../constants/settings";

// Tabs in one card: side by side on small screens, a list from lg.
// The open tab looks like the sidebar's current page (soft tint + slim bar on the left).
const SettingsNav = ({ active, onChange }) => (
  <nav className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/80 lg:grid-cols-1 lg:p-2" aria-label="Settings">
    {SETTINGS_TABS.map((tab) => {
      const isActive = tab.key === active;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          aria-current={isActive ? "page" : undefined}
          className={`relative flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/20 ${
            isActive
              ? "bg-slate-100 text-slate-900 before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-r-full before:bg-brand"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "bg-slate-50 text-slate-500"}`}
          >
            <tab.icon className="size-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className={`block truncate text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
            <span className="block truncate text-xs text-slate-500">{tab.hint}</span>
          </span>
        </button>
      );
    })}
  </nav>
);

export default SettingsNav;
