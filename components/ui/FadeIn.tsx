"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
  className?: string;
};

/** Subtle fade-and-rise entrance. Renders in place when reduced motion is on. */
export default function FadeIn({ children, delay = 0, y = 16, className }: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
