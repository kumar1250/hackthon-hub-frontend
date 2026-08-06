import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
const MotionLink = motion(RouterLink);
const variants = {
  primary:
    "bg-gradient-to-r from-cyan to-purple text-void shadow-[0_0_30px_-6px_rgba(34,211,238,0.55)] hover:shadow-[0_0_45px_-4px_rgba(168,85,247,0.65)]",
  secondary:
    "glass text-ink border border-line hover:border-cyan/50",
  ghost: "text-mist hover:text-ink",
  danger: "bg-gradient-to-r from-magenta to-neon-pink text-void",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

/** Reusable button with magnetic hover lift + shine sweep. Renders <button> or, with `as="a"`, a link. */
const Button = forwardRef(function Button(
  { children, variant = "primary", size = "md", className, as = "button", loading = false, ...props },
  ref
) {
  const Comp = motion[as] ?? motion.button;

  return (
    <Comp
    
      ref={ref}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      disabled={loading || props.disabled}
      className={cn(
        "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-display font-medium tracking-tight transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </Comp>
  );
});

export default Button;