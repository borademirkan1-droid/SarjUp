"use client";

import { CinematicHero } from "@/components/sections/cinematic-hero";
import { NetworkSection } from "@/components/sections/network-section";
import { Stats } from "@/components/stats";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <CinematicHero />
      <Stats />
      <NetworkSection />
    </main>
  );
}
