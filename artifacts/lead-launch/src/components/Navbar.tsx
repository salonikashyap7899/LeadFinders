import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

export function Navbar({ dark = false }: { dark?: boolean }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? "text-[#A78BFA]"
        : "text-[#8B8BAD] hover:text-[#F4F4FF]"
    }`;

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(10,11,20,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: "#6C63FF" }}
          >
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F4F4FF]">
            Lead<span style={{ color: "#A78BFA" }}>→</span>Launch
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
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-85"
            style={{ background: "#6C63FF" }}
          >
            <Zap className="h-3.5 w-3.5" />
            Start Free
          </Link>
        </div>

        <button
          className="md:hidden text-[#8B8BAD] hover:text-[#F4F4FF] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-4"
          style={{ background: "#12142A", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
        >
          <Link to="/" className={linkClass("/")} onClick={() => setOpen(false)}>Home</Link>
          <Link to="/how-it-works" className={linkClass("/how-it-works")} onClick={() => setOpen(false)}>How It Works</Link>
          <Link to="/app" className={linkClass("/app")} onClick={() => setOpen(false)}>Launch Tool</Link>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
            style={{ background: "#6C63FF" }}
            onClick={() => setOpen(false)}
          >
            <Zap className="h-3.5 w-3.5" /> Start Free
          </Link>
        </div>
      )}
    </header>
  );
}
