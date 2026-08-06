import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { EVENT } from "../lib/constants";
import { cn } from "../lib/cn";
import logo from "../assets/logo.png";

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

  useEffect(() => setOpen(false), [location.pathname]);

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
      className={cn(
        "sticky top-0 z-30 w-full px-5 py-4 transition-all duration-300 sm:px-6 sm:py-5 md:px-10",
        scrolled ? "glass border-b border-line/70" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src={logo}
            alt={`${EVENT.college} crest`}
            className="h-11 w-11 shrink-0 rounded-full object-contain shadow-[0_4px_20px_-6px_rgba(43,27,16,0.45)] transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
              {EVENT.name}
            </span>
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-widest text-mist sm:block">
              {EVENT.college}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 font-mono text-xs uppercase tracking-widest text-mist sm:flex">
          {LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-full px-4 py-2 transition-colors",
                  active ? "text-void" : "hover:text-cyan"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan to-purple"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="glass flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-transform duration-200 active:scale-95 sm:hidden"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden font-mono text-sm uppercase tracking-widest text-mist sm:hidden"
          >
            <div className="glass mt-4 flex flex-col gap-1.5 rounded-2xl p-2">
              {LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "rounded-xl px-4 py-3 transition-colors",
                      active ? "bg-gradient-to-r from-cyan to-purple text-void" : "hover:bg-ink/5 hover:text-cyan"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}