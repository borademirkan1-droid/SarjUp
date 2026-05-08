"use client";

import { IntersectionOptions, useInView } from "react-intersection-observer";

export function useReveal(options: IntersectionOptions = {}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    ...options,
  });

  return { ref, inView };
}
