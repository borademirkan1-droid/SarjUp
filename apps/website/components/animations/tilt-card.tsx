"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glareEffect?: boolean;
};

export function TiltCard({ children, className, maxTilt = 15, glareEffect = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 220, damping: 18 });
  const springRotateY = useSpring(rotateY, { stiffness: 220, damping: 18 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 55%)`;

  const supportsHover =
    typeof window !== "undefined" ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : false;

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!supportsHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative transform-gpu ${className ?? ""}`.trim()}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {glareEffect && supportsHover ? (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: glareBackground, borderRadius: "inherit" }}
        />
      ) : null}
    </motion.div>
  );
}
