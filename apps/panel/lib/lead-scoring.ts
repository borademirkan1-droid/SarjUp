import type { LeadRow, LeadPipelineStatus } from "@/lib/supabase/types";

export type { LeadPipelineStatus };

export interface ScoredLead extends LeadRow {
  score: number;
  statusLabel: string;
}

/**
 * Kural tabanlı lead scoring (0–100).
 * Mevcut LeadRow alanlarına göre uyarlandı.
 */
export function scoreLeads(leads: LeadRow[]): ScoredLead[] {
  return leads.map((lead) => {
    let score = 50; // base

    // İşletme adı varsa +10
    if (lead.business_name) score += 10;
    // Telefon varsa +15
    if (lead.phone) score += 15;
    // Email varsa +10
    if (lead.email) score += 10;
    // Web form başvurusu = daha sıcak +10
    if (lead.source === "web_form") score += 10;
    // Manuel eklendi = sıcak lead +5
    if (lead.source === "manual") score += 5;
    // Bölge bilgisi varsa +5
    if (lead.region) score += 5;

    const clampedScore = Math.min(score, 100);

    return {
      ...lead,
      pipeline_status: lead.pipeline_status ?? "new",
      score: clampedScore,
      statusLabel: scoreToHeatLabel(clampedScore),
    };
  });
}

function scoreToHeatLabel(score: number): string {
  if (score >= 85) return "🔥 Sıcak";
  if (score >= 70) return "✅ Nitelikli";
  if (score >= 55) return "👀 İnceleniyor";
  return "❄️ Soğuk";
}
