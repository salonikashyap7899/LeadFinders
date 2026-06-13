import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";

export function Navbar({ dark = false }: { dark?: boolean }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? dark ? "text-white" : "text-primary"
        : dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <header className={`sticky top-0 z-40 border-b ${dark ? "bg-slate-900/90 border-slate-800 backdrop-blur" : "bg-white/90 border-slate-200 backdrop-blur"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:shadow-indigo-600/50 transition-shadow">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Lead<span className="text-indigo-500">→</span>Launch
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/how-it-works" className={linkClass("/how-it-works")}>How It Works</Link>
          <Link to="/app" className={linkClass("/app")}>Launch Tool</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-600/25"
          >
            <Zap className="h-3.5 w-3.5" />
            Start Free
          </Link>
        </div>

        <button
          className={`md:hidden ${dark ? "text-slate-300" : "text-slate-600"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t px-6 py-4 flex flex-col gap-4 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <Link to="/" className={linkClass("/")} onClick={() => setOpen(false)}>Home</Link>
          <Link to="/how-it-works" className={linkClass("/how-it-works")} onClick={() => setOpen(false)}>How It Works</Link>
          <Link to="/app" className={linkClass("/app")} onClick={() => setOpen(false)}>Launch Tool</Link>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <Zap className="h-3.5 w-3.5" /> Start Free
          </Link>
        </div>
      )}
    </header>
  );
}
