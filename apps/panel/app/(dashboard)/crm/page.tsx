import { createClient } from "@/lib/supabase/server";
import { scoreLeads } from "@/lib/lead-scoring";
import type { LeadPipelineStatus } from "@/lib/supabase/types";

const STATUSES: LeadPipelineStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

const STATUS_LABELS: Record<LeadPipelineStatus, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  qualified: "Nitelikli",
  proposal: "Teklif Verildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

const STATUS_COLORS: Record<LeadPipelineStatus, string> = {
  new: "border-slate-300 bg-slate-50 dark:bg-slate-900/30",
  contacted: "border-blue-300 bg-blue-50 dark:bg-blue-900/20",
  qualified: "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20",
  proposal: "border-amber-300 bg-amber-50 dark:bg-amber-900/20",
  won: "border-green-400 bg-green-50 dark:bg-green-900/20",
  lost: "border-red-300 bg-red-50 dark:bg-red-900/20",
};

export default async function CRMPage() {
  const supabase = createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const scored = scoreLeads(leads ?? []);

  const byStatus = STATUSES.map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    colorClass: STATUS_COLORS[s],
    leads: scored.filter((l) => l.pipeline_status === s),
  }));

  const hotCount = scored.filter((l) => l.score >= 85).length;
  const qualifiedCount = scored.filter(
    (l) => l.score >= 70 && l.score < 85
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toplam {scored.length} lead · 🔥 Sıcak: {hotCount} · ✅ Nitelikli:{" "}
            {qualifiedCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {byStatus.map(({ status, label, colorClass, leads: columnLeads }) => (
          <div
            key={status}
            className={`rounded-lg border p-3 space-y-2 ${colorClass}`}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold">{columnLeads.length}</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {columnLeads.slice(0, 10).map((l) => {
                const displayName =
                  l.business_name ??
                  [l.first_name, l.last_name].filter(Boolean).join(" ") ??
                  "—";
                return (
                  <div
                    key={l.id}
                    className="text-xs p-1.5 rounded bg-background/70 border border-border/50"
                  >
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-muted-foreground">{l.statusLabel}</p>
                  </div>
                );
              })}
              {columnLeads.length > 10 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{columnLeads.length - 10} daha
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
