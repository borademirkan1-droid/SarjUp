"use client";

import { GradientMesh } from "./gradient-mesh";
import { ParticlesBg } from "./particles-bg";

export function GlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-black" />
      <GradientMesh />
      <ParticlesBg density="medium" interactive={true} showConnections={true} />
    </div>
  );
}
