"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { partners } from "@/lib/data/partners";

const PARTNER_CITIES = ["İstanbul", "İzmir", "Ankara", "Antalya", "Bursa", "Eskişehir"];

function normalizeCity(name: string): string {
  return name?.toLocaleLowerCase("tr-TR")?.replace("i̇", "i")?.trim() || "";
}

function isPartnerCity(geoName: string): boolean {
  const normalized = normalizeCity(geoName);
  return PARTNER_CITIES.some((city) => normalizeCity(city) === normalized);
}

export function TurkeyMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <div className="relative w-full">
      {hoveredCity ? (
        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-cyan-400/30 bg-black/80 px-4 py-2 backdrop-blur-md">
          <span className="font-mono text-sm uppercase tracking-wider text-white">{hoveredCity}</span>
        </div>
      ) : null}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [35.5, 39],
          scale: 2400,
        }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto", background: "transparent" }}
      >
        <Geographies geography="/data/turkey-cities.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              const cityName = geo.properties.name || geo.properties.NAME_1 || "";
              const isPartner = isPartnerCity(cityName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => setHoveredCity(cityName)}
                  onMouseLeave={() => setHoveredCity(null)}
                  fill={isPartner ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.02)"}
                  stroke="rgba(0, 212, 255, 0.35)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "rgba(0, 212, 255, 0.18)",
                      stroke: "rgba(0, 212, 255, 0.8)",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {partners.map((partner) => (
          <Marker key={partner.id} coordinates={partner.coordinates}>
            {partner.status === "active" ? (
              <g>
                <circle r={14} fill="rgba(16, 185, 129, 0.25)" className="animate-ping-slow" />
                <circle r={6} fill="#10B981" stroke="#fff" strokeWidth={1.5} />
              </g>
            ) : (
              <circle r={5} fill="rgba(107, 114, 128, 0.6)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth={1} />
            )}
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
