"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { useState } from "react";

type SocialItem = {
  id: "instagram" | "tiktok" | "facebook" | "whatsapp";
  href: string;
  label: string;
  active: boolean;
  tooltip?: string;
};

const items: SocialItem[] = [
  { id: "instagram", href: "https://instagram.com/sarjup_", label: "Instagram", active: true },
  { id: "tiktok", href: "#", label: "TikTok", active: false, tooltip: "Yakında" },
  { id: "facebook", href: "#", label: "Facebook", active: false, tooltip: "Yakında" },
  { id: "whatsapp", href: "https://wa.me/905403664141", label: "WhatsApp", active: true },
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function SocialIcon({ id }: { id: SocialItem["id"] }) {
  if (id === "instagram") return <Instagram className="h-[18px] w-[18px]" />;
  if (id === "facebook") return <Facebook className="h-[18px] w-[18px]" />;
  if (id === "tiktok") return <TikTokIcon />;
  return <WhatsAppIcon />;
}

export function SocialIcons() {
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      {items.map((item) => {
        const showTooltip = tooltipId === item.id && !item.active;
        return (
          <div key={item.id} className="relative">
            <Link
              href={item.href}
              target={item.active ? "_blank" : undefined}
              rel={item.active ? "noopener noreferrer" : undefined}
              aria-label={item.label}
              onMouseEnter={() => {
                if (!item.active) setTooltipId(item.id);
              }}
              onMouseLeave={() => setTooltipId(null)}
              onFocus={() => {
                if (!item.active) setTooltipId(item.id);
              }}
              onBlur={() => setTooltipId(null)}
              onClick={(event) => {
                if (!item.active) {
                  event.preventDefault();
                  setTooltipId(item.id);
                }
              }}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-200 ${
                item.active
                  ? "hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  : "cursor-not-allowed"
              }`}
            >
              <SocialIcon id={item.id} />
            </Link>

            <div
              className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-black/90 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur transition-opacity duration-200 ${
                showTooltip ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.tooltip}
            </div>
          </div>
        );
      })}
    </div>
  );
}
