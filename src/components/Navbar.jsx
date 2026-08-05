import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { EVENT } from "../lib/constants";

const LINKS = [
  { to: "/problem-statements", label: "Problems" },
  { to: "/register", label: "Register" },
  { to: "/team/login", label: "Team Login" },
  { to: "/admin/login", label: "Admin" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 mx-auto w-full border-b border-line/50 bg-white/95 px-5 py-4 shadow-sm transition-all duration-300 backdrop-blur-sm sm:px-6 sm:py-5 md:px-10 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal via-sky to-violet font-mono text-sm font-bold text-ink shadow-[0_4px_20px_rgba(102,119,255,0.25)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
            &lt;/&gt;
          </span>
          <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
            {EVENT.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 font-mono text-xs uppercase tracking-widest text-mist sm:flex">
          {LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative rounded-full px-4 py-2 transition-colors ${
                  active ? "text-ink" : "hover:text-teal"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-teal to-sky" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink transition-transform duration-200 active:scale-95 sm:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <nav
        className={`grid overflow-hidden font-mono text-sm uppercase tracking-widest text-mist transition-all duration-300 sm:hidden ${
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white p-2 min-h-0">
          {LINKS.map((link, i) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={`rounded-xl px-4 py-3 transition-colors ${
                  active
                    ? "bg-gradient-to-r from-teal to-sky text-ink"
                    : "hover:bg-surface hover:text-teal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
