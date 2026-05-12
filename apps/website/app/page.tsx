"use client";

import { CinematicHero } from "@/components/sections/cinematic-hero";
import { DeviceShowcase } from "@/components/sections/device-showcase";
import { NetworkSection } from "@/components/sections/network-section";
import { Stats } from "@/components/stats";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <CinematicHero />
      <Stats />
      <DeviceShowcase />
      <NetworkSection />
    </main>
  );
}
