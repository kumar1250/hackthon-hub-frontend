import { useState } from "react";
import { downloadElementAsPdf } from "../lib/pdf";

export default function DownloadPdfButton({
  targetRef,
  filename = "document",
  label = "Download PDF",
  background = "#ffffff",
  className = "",
}) {
  const [state, setState] = useState("idle"); // idle | working | done | error

  async function handleClick() {
    if (!targetRef?.current || state === "working") return;
    setState("working");
    try {
      await downloadElementAsPdf(targetRef.current, filename, { background });
      setState("done");
      setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      console.error(err);
      setState("error");
      setTimeout(() => setState("idle"), 2200);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "working"}
      className={
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-ink transition-transform disabled:cursor-wait disabled:opacity-80 sm:w-auto " +
        "bg-linear-to-r from-teal via-sky to-violet animate-gradient hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(43,230,200,0.4)] " +
        className
      }
    >
      <span className="pointer-events-none absolute inset-0 animate-shimmer" />
      <PdfIcon state={state} />
      <span className="relative z-10">
        {state === "working" && "Preparing PDF…"}
        {state === "done" && "Downloaded ✓"}
        {state === "error" && "Try again"}
        {state === "idle" && label}
      </span>
    </button>
  );
}

function PdfIcon({ state }) {
  if (state === "working") {
    return (
      <svg viewBox="0 0 24 24" className="relative z-10 h-4 w-4 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="relative z-10 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" />
    </svg>
  );
}
