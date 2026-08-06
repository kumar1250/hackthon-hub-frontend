import { forwardRef, useState } from "react";
import { cn } from "../lib/cn";

/** Floating-label glass input, shared by Register / Team & Admin login forms. */
const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative">
      <input
        ref={ref}
        id={inputId}
        placeholder=" "
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "peer w-full rounded-xl border bg-white/60 px-4 pt-5 pb-2 text-sm text-ink outline-none transition-colors backdrop-blur-sm",
          "border-line placeholder-transparent focus:border-cyan/60",
          error && "border-magenta/70",
          className
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mist transition-all",
            "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-cyan",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
            focused && "text-cyan"
          )}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1.5 text-xs text-neon-pink">{error}</p>}
    </div>
  );
});

export default Input;