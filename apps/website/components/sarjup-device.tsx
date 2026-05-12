"use client";

import { motion, useReducedMotion } from "framer-motion";

type SarjupDeviceProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function SarjupDevice({ width = 280, height = 260, className }: SarjupDeviceProps) {
  const prefersReduced = useReducedMotion();
  const scale = width / 280;

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 280 260"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_60px_rgba(0,200,220,0.25)]"
      >
        <defs>
          <linearGradient id="sd-chromeSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="30%" stopColor="#2d3561" />
            <stop offset="60%" stopColor="#c8d6e5" />
            <stop offset="80%" stopColor="#8395a7" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="sd-chromeSideR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="30%" stopColor="#2d3561" />
            <stop offset="60%" stopColor="#c8d6e5" />
            <stop offset="80%" stopColor="#8395a7" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>
          <linearGradient id="sd-acrylicFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8f4f8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#f0f8ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c8e6f0" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="sd-bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="sd-cyanGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#06d6a0" />
          </linearGradient>
          <filter id="sd-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sol krom yan panel */}
        <path
          d="M 20 245 L 20 120 Q 20 20 80 20 L 95 20 L 95 245 Z"
          fill="url(#sd-chromeSide)"
          opacity="0.9"
        />

        {/* Sağ krom yan panel */}
        <path
          d="M 260 245 L 260 120 Q 260 20 200 20 L 185 20 L 185 245 Z"
          fill="url(#sd-chromeSideR)"
          opacity="0.9"
        />

        {/* Ana gövde */}
        <path
          d="M 95 20 L 185 20 Q 185 20 185 245 L 95 245 Z"
          fill="url(#sd-bodyGrad)"
        />

        {/* Akrilik yüzey efekti */}
        <path
          d="M 80 20 Q 140 8 200 20 L 200 245 L 80 245 Z"
          fill="url(#sd-acrylicFace)"
        />

        {/* Çerçeve - arch */}
        <path
          d="M 20 245 L 20 120 Q 20 20 140 20 Q 260 20 260 120 L 260 245 Z"
          fill="none"
          stroke="url(#sd-cyanGlow)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Logo dairesi */}
        <circle
          cx="140"
          cy="130"
          r="32"
          fill="none"
          stroke="url(#sd-cyanGlow)"
          strokeWidth="2"
          filter="url(#sd-glow)"
        />
        <circle cx="140" cy="130" r="26" fill="#0f172a" />

        {/* Şimşek ikonu */}
        <path
          d="M 145 113 L 135 130 L 141 130 L 136 148 L 148 128 L 142 128 Z"
          fill="url(#sd-cyanGlow)"
          filter="url(#sd-glow)"
        />

        {/* LED sarj göstergesi noktaları */}
        <circle cx="112" cy="88" r="4" fill="#00b4d8" opacity="0.9" filter="url(#sd-glow)" />
        <circle cx="124" cy="88" r="4" fill="#00b4d8" opacity="0.7" />
        <circle cx="136" cy="88" r="4" fill="#1a1a2e" stroke="#334155" strokeWidth="1" />

        {/* ŞarjUp yazısı */}
        <text
          x="140"
          y="185"
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          ŞarjUp
        </text>
        <text
          x="140"
          y="200"
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="7"
          fontFamily="monospace"
          letterSpacing="1"
        >
          sarjup.com.tr
        </text>

        {/* Alt bilgi şeridi */}
        <rect x="80" y="230" width="120" height="12" rx="2" fill="rgba(255,255,255,0.04)" />
        <text
          x="140"
          y="239"
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="5.5"
          fontFamily="monospace"
        >
          0540 366 41 41 • @sarjup_
        </text>

        {/* Kablo */}
        <path
          d="M 108 245 Q 108 256 98 262 Q 80 270 70 290"
          stroke="#2d3561"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 108 245 Q 108 256 98 262 Q 80 270 70 290"
          stroke="#4a5568"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="3 2"
        />

        {/* Konnektör ucu */}
        <rect x="65" y="288" width="10" height="5" rx="1" fill="#718096" />

        {/* GPS anteni */}
        <circle cx="190" cy="60" r="3" fill="#06d6a0" opacity="0.8" filter="url(#sd-glow)" />

        {/* Yüzey parlaması */}
        <path
          d="M 95 22 Q 140 12 185 22 L 185 80 Q 140 60 95 80 Z"
          fill="white"
          opacity="0.04"
        />
      </svg>

      {/* Ambient glow */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,180,216,0.15) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
