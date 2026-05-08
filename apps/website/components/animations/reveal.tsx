"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useReveal } from "@/lib/hooks/use-reveal";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  className?: string;
};

function getInitialPosition(direction: RevealProps["direction"], distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "fade":
      return {};
    case "up":
    default:
      return { y: distance };
  }
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 30,
  className,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useReveal();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initialOffset = getInitialPosition(direction, distance);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...initialOffset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialOffset }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
