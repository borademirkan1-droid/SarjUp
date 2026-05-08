"use client";

import { ReactNode, useRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { motion, useMotionValue, useSpring } from "framer-motion";

type MagneticButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
  strength?: number;
};

export function MagneticButton({
  children,
  strength = 0.3,
  className,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 24 });
  const springY = useSpring(y, { stiffness: 260, damping: 24 });

  const supportsHover =
    typeof window !== "undefined" ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : false;

  const handleMouseMove: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!supportsHover || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set(offsetX * strength);
    y.set(offsetY * strength);
    onMouseMove?.(event);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    x.set(0);
    y.set(0);
    onMouseLeave?.(event);
  };

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      style={{ x: springX, y: springY }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}
