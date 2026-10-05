import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 backdrop-blur sticky top-0 z-10 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-500 shadow-lg shadow-teal-500/20" />
            <span className="font-semibold tracking-tight">Visual Assistant</span>
          </NavLink>
          <nav className="flex gap-8 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-teal-400" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              Demo
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-teal-400" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              API Docs
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
