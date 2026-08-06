import { motion } from "framer-motion";
import { blurReveal } from "./variants";

/** Scroll-triggered reveal, drop-in replacement for the old CSS-based Reveal. */
export default function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      variants={blurReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: delay / 1000 }}
    >
      {children}
    </Tag>
  );
}