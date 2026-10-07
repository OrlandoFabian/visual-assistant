import { NavLink, Outlet } from "react-router-dom";

import { sections } from "../docs-content/sections";

export default function DocsLayout() {
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-slate-800/80 bg-slate-900/40 px-4 py-6">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </h2>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.slug}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block rounded px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-teal-500/10 text-teal-300"
                            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                        }`
                      }
                    >
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
