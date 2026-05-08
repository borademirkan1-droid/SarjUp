"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type MediaSlotProps = {
  src: string;
  fallbackImage?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  enableKenBurns?: boolean;
  kenBurnsScale?: number;
  kenBurnsDuration?: number;
  width?: number;
  height?: number;
  fill?: boolean;
  objectFit?: "cover" | "contain";
};

const VIDEO_EXTENSIONS = [".mp4", ".webm"];

function isVideoSource(src: string) {
  const normalized = src.toLowerCase().split("?")[0];
  return VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

export function MediaSlot({
  src,
  fallbackImage,
  alt,
  className,
  priority = false,
  enableKenBurns = false,
  kenBurnsScale = 1.05,
  kenBurnsDuration = 8,
  width = 1200,
  height = 900,
  fill = false,
  objectFit = "cover",
}: MediaSlotProps) {
  const prefersReducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const isVideo = useMemo(() => isVideoSource(src), [src]);
  const canUseVideo = isVideo && !videoFailed;
  const resolvedImageSrc = fallbackImage ?? src;
  const objectFitClass = objectFit === "contain" ? "object-contain" : "object-cover";
  const mediaClassName = `${fill ? "absolute inset-0 h-full w-full" : "h-auto w-full"} ${objectFitClass}`;
  const shouldAnimateKenBurns = enableKenBurns && !prefersReducedMotion;

  if (canUseVideo) {
    return (
      <video
        src={src}
        className={`${mediaClassName} ${className ?? ""}`.trim()}
        autoPlay
        muted
        loop
        playsInline
        poster={fallbackImage}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  const imageNode = (
    <Image
      src={resolvedImageSrc}
      alt={alt}
      priority={priority}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={`${mediaClassName} ${className ?? ""}`.trim()}
      sizes={fill ? "100vw" : undefined}
    />
  );

  if (!shouldAnimateKenBurns) {
    return imageNode;
  }

  return (
    <motion.div
      className={fill ? "absolute inset-0" : "w-full"}
      animate={{
        scale: [1, kenBurnsScale, 1],
        x: [0, -10, 0],
        y: [0, -5, 0],
      }}
      transition={{
        duration: kenBurnsDuration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {imageNode}
    </motion.div>
  );
}
