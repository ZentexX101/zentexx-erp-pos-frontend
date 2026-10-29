import { SETTINGS_TABS } from "../../constants/settings";

// Tabs across the top on small screens, a side list from lg
const SettingsNav = ({ active, onChange }) => (
  <nav className="flex gap-1 border-b border-slate-200 lg:flex-col lg:gap-1 lg:border-b-0" aria-label="Settings">
    {SETTINGS_TABS.map((tab) => {
      const isActive = tab.key === active;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          aria-current={isActive ? "page" : undefined}
          className={`-mb-px flex items-center gap-3 border-b-2 px-3 pb-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/20 lg:mb-0 lg:rounded-lg lg:border-b-0 lg:py-2.5 ${
            isActive
              ? "border-brand text-slate-900 lg:bg-white lg:shadow-sm lg:ring-1 lg:ring-slate-200"
              : "border-transparent text-slate-600 hover:text-slate-900 lg:hover:bg-white/70"
          }`}
        >
          <tab.icon className={`size-4.5 shrink-0 ${isActive ? "text-slate-900" : "text-slate-500"}`} aria-hidden="true" />
          <span>
            {tab.label}
            <span className="hidden text-xs font-normal text-slate-500 lg:block">{tab.hint}</span>
          </span>
        </button>
      );
    })}
  </nav>
);

export default SettingsNav;
