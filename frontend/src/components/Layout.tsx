import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <NavLink
            to="/"
            className="font-semibold tracking-tight text-slate-100"
          >
            Visual Assistant
          </NavLink>
          <nav className="flex gap-8 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-teal-400"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              Demo
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "text-teal-400"
                    : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              API Docs
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
