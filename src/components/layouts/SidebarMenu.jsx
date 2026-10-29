import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { matchPath, NavLink } from "react-router";

const itemClass = (active, iconOnly) =>
  `group flex h-10 w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${iconOnly ? "justify-center" : "px-3"} ${
    active
      ? "bg-slate-100 text-slate-900 ring-1 ring-inset ring-slate-200"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
  }`;

const iconClass = (active) => `size-5 shrink-0 ${active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`;

const subItemClass = ({ isActive }) =>
  `-ml-px flex h-9 items-center border-l pl-4 pr-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${
    isActive ? "border-brand font-medium text-slate-900" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
  }`;

// A dropdown with only one page is shown as a plain link to that page
const flatten = (item) =>
  item.children?.length === 1 ? { label: item.label, icon: item.icon, path: item.children[0].path } : item;

// Menu sections from the panel config. Section headings collapse their section;
// dropdowns start open when they hold the current page.
const SidebarMenu = ({ sections, iconOnly, searching, pathname, onNavigate }) => {
  const [closedSections, setClosedSections] = useState({});
  const [openGroups, setOpenGroups] = useState({});

  const isGroupActive = (item) => item.children.some((child) => matchPath({ path: child.path, end: false }, pathname));
  const isGroupOpen = (item) => searching || (openGroups[item.label] ?? isGroupActive(item));

  return sections.map((section, index) => {
    const sectionOpen = iconOnly || searching || !closedSections[section.title];

    return (
      <div key={section.title} className={index > 0 ? "mt-5" : "mt-3"}>
        {iconOnly ? (
          index > 0 && <div className="mx-auto mb-3 h-px w-6 bg-slate-200" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={() => setClosedSections((prev) => ({ ...prev, [section.title]: sectionOpen }))}
            aria-expanded={sectionOpen}
            className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 outline-none transition-colors hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-brand/20"
          >
            {section.title}
            <LuChevronDown className={`size-4 transition-transform duration-200 ${sectionOpen ? "" : "-rotate-90"}`} aria-hidden="true" />
          </button>
        )}

        {sectionOpen && (
          <ul className="space-y-1">
            {section.items.map((entry) => {
              const item = flatten(entry);

              // Single page
              if (!item.children) {
                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={onNavigate}
                      title={iconOnly ? item.label : undefined}
                      className={({ isActive }) => itemClass(isActive, iconOnly)}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={iconClass(isActive)} aria-hidden="true" />
                          {!iconOnly && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              }

              const active = isGroupActive(item);

              // Icon-only: the icon opens the group's first page
              if (iconOnly) {
                return (
                  <li key={item.label}>
                    <NavLink to={item.children[0].path} title={item.label} className={itemClass(active, true)}>
                      <item.icon className={iconClass(active)} aria-hidden="true" />
                    </NavLink>
                  </li>
                );
              }

              const open = isGroupOpen(item);

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !open }))}
                    aria-expanded={open}
                    className={`group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${
                      active ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className={iconClass(active)} aria-hidden="true" />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    <LuChevronDown
                      aria-hidden="true"
                      className={`size-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <ul className="mb-1 ml-5.5 mt-1 space-y-0.5 border-l border-slate-200">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink to={child.path} end onClick={onNavigate} className={subItemClass}>
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  });
};

export default SidebarMenu;
