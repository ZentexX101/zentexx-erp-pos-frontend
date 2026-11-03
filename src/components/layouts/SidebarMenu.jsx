import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { matchPath, NavLink } from "react-router";

// Current page: a soft tint with dark text and a slim accent bar on the left (not a heavy solid block)
const itemClass = (active, iconOnly) =>
  `group relative flex h-10 w-full items-center gap-3 rounded-lg text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${iconOnly ? "justify-center" : "px-3"} ${
    active
      ? `bg-slate-100 font-semibold text-slate-900 ${iconOnly ? "" : "before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-brand"}`
      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  }`;

const iconClass = (active) => `size-[18px] shrink-0 transition-colors ${active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700"}`;

// A dropdown holding the current page keeps a dark label and icon (the page itself gets the pill style below)
const groupClass = (active) =>
  `group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand/20 ${
    active ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
  }`;

// Pages inside a dropdown: a dot on the guide line, filled for the current page
const subItemClass = ({ isActive }) =>
  `group/sub flex h-9 items-center gap-2.5 rounded-md pl-3 pr-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${
    isActive ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
      <div key={section.title} className={index > 0 ? "mt-6" : "mt-4"}>
        {iconOnly ? (
          index > 0 && <div className="mx-auto mb-3 h-px w-6 bg-slate-200" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={() => setClosedSections((prev) => ({ ...prev, [section.title]: sectionOpen }))}
            aria-expanded={sectionOpen}
            className="group/section mb-1.5 flex w-full items-center justify-between rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 outline-none transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand/20"
          >
            {section.title}
            {/* The arrow shows on hover, or always while the section is closed */}
            <LuChevronDown
              className={`size-3.5 transition duration-200 ${sectionOpen ? "opacity-0 group-hover/section:opacity-100" : "-rotate-90"}`}
              aria-hidden="true"
            />
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
                    className={groupClass(active)}
                  >
                    <item.icon className={`size-[18px] shrink-0 ${active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-700"}`} aria-hidden="true" />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    <LuChevronDown
                      aria-hidden="true"
                      className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <ul className="mb-1 ml-[21px] mt-1 space-y-0.5 border-l border-slate-200 pl-2">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink to={child.path} end onClick={onNavigate} className={subItemClass}>
                            {({ isActive }) => (
                              <>
                                <span
                                  className={`size-1.5 shrink-0 rounded-full transition-colors ${isActive ? "bg-brand" : "bg-slate-300 group-hover/sub:bg-slate-500"}`}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{child.label}</span>
                              </>
                            )}
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
