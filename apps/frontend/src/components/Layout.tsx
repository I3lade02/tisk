import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen text-ink">
      <header className="border-b border-line/70 bg-panel/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tisk Monitor
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              Interní monitoring síťových tiskáren přes SNMP.
            </p>
          </div>

          <nav className="flex items-center gap-2 rounded-full border border-line bg-white/80 p-1">
            <Link
              to="/"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                location.pathname === "/"
                  ? "bg-accent text-white"
                  : "text-slate-700 hover:bg-accent/10"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
