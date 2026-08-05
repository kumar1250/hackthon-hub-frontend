import { Link } from "react-router-dom";
import { EVENT } from "../lib/constants";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-line/70 bg-white/80 px-5 py-8 shadow-sm sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 text-xs text-mist sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-semibold text-paper">{EVENT.name}</p>
          <p className="mt-0.5">
            {EVENT.college}, {EVENT.place}
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <Link to="/problem-statements" className="transition-colors hover:text-teal">
            Problems
          </Link>
          <Link to="/register" className="transition-colors hover:text-pink">
            Register
          </Link>
          <span className="hidden text-line sm:inline">·</span>
          <span className="hidden sm:inline">Registrations logged to teams.xlsx</span>
        </div>
      </div>
    </footer>
  );
}
