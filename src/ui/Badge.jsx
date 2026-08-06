import { cn } from "../lib/cn";

const tones = {
  cyan: "border-cyan/40 text-cyan bg-cyan/10",
  purple: "border-purple/40 text-purple bg-purple/10",
  pink: "border-neon-pink/40 text-neon-pink bg-neon-pink/10",
  coral: "border-coral/40 text-coral bg-coral/10",
  amber: "border-amber/40 text-amber bg-amber/10",
  mint: "border-mint/40 text-mint bg-mint/10",
};

export default function Badge({ children, tone = "cyan", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}