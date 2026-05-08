"use client";

import { useEffect, useRef } from "react";

type ParticlesBgProps = {
  density?: "low" | "medium" | "high";
  className?: string;
  interactive?: boolean;
  showConnections?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
};

const DENSITY_COUNTS = {
  low: { desktop: 50, mobile: 22 },
  medium: { desktop: 80, mobile: 30 },
  high: { desktop: 100, mobile: 36 },
};

export function ParticlesBg({
  density = "medium",
  className,
  interactive = true,
  showConnections = true,
}: ParticlesBgProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const darkMode = document.documentElement.classList.contains("dark");
    const palette = darkMode
      ? ["rgba(0, 102, 255, 0.9)", "rgba(16, 185, 129, 0.85)"]
      : ["rgba(0, 70, 170, 0.75)", "rgba(14, 120, 90, 0.7)"];

    const mouse = { x: 0, y: 0, active: false };
    const particles: Particle[] = [];
    let rafId = 0;
    let visible = !document.hidden;

    const connectionDistance = 140;
    const isMobile = window.innerWidth < 768;
    const particleCount = DENSITY_COUNTS[density][isMobile ? "mobile" : "desktop"];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticle = (): Particle => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 1 + Math.random() * 2.3,
      color: palette[Math.floor(Math.random() * palette.length)] ?? palette[0],
    });

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i += 1) {
        particles.push(createParticle());
      }
    };

    const drawConnections = () => {
      if (!showConnections) return;

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const p1 = particles[i];
          const p2 = particles[j];
          if (!p1 || !p2) continue;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.hypot(dx, dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * (darkMode ? 0.25 : 0.2);
            ctx.strokeStyle = darkMode
              ? `rgba(125, 211, 252, ${alpha})`
              : `rgba(30, 64, 175, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      if (!visible) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        if (interactive && mouse.active) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 180) {
            particle.vx += (dx / distance) * 0.005;
            particle.vy += (dy / distance) * 0.005;
          }
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy *= 0.985;

        if (particle.x <= 0 || particle.x >= window.innerWidth) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= window.innerHeight) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
        particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      drawConnections();
      rafId = window.requestAnimationFrame(tick);
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onVisibilityChange = () => {
      visible = !document.hidden;
    };

    resize();
    initParticles();
    tick();

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (interactive) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (interactive) {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [density, interactive, showConnections]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
