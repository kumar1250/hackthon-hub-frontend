export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export const blurReveal = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 16 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

export const textRevealChar = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: "0%", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(6px)" },
};