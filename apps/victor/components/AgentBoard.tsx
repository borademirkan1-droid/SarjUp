"use client";

import { useState } from "react";
import type { AgentTask, AgentName } from "@/lib/types";
import { AGENT_META } from "@/lib/types";
import { supabaseService } from "@/lib/supabase";

interface Props {
  tasks: AgentTask[];
  loading: boolean;
  onRefresh: () => void;
}

const STATUS_CONFIG = {
  pending:   { label: "Bekliyor",    color: "#ffa500", dot: "rgba(255,165,0,0.6)" },
  running:   { label: "Çalışıyor",   color: "#00d4ff", dot: "#00d4ff" },
  completed: { label: "Tamamlandı",  color: "#00ff9d", dot: "#00ff9d" },
  failed:    { label: "Hata",        color: "#ff4444", dot: "#ff4444" },
  cancelled: { label: "İptal",       color: "rgba(255,255,255,0.3)", dot: "rgba(255,255,255,0.2)" },
};

function AgentCard({ agent, tasks }: { agent: AgentName; tasks: AgentTask[] }) {
  const meta     = AGENT_META[agent];
  const running  = tasks.find((t) => t.status === "running");
  const recent   = tasks.filter((t) => t.status !== "running").slice(0, 3);
  const total    = tasks.length;
  const done     = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.01]"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${meta.color}22` }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}40`, color: meta.color }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider" style={{ color: meta.color }}>{meta.label.toUpperCase()}</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{done}/{total} tamamlandı</p>
          </div>
        </div>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] tracking-wider"
            style={{ color: "#00d4ff" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00d4ff" }} />
            AKTİF
          </span>
        )}
      </div>

      {/* Active task */}
      {running && (
        <div className="rounded-xl p-3"
          style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <p className="text-[10px] tracking-widest mb-1" style={{ color: "#00d4ff" }}>ÇALIŞIYOR</p>
          <p className="text-xs leading-relaxed" style={{ color: "#c8c8d8" }}>{running.task_description}</p>
        </div>
      )}

      {/* Recent tasks */}
      {recent.length > 0 && (
        <div className="space-y-1.5">
          {recent.map((t) => {
            const s = STATUS_CONFIG[t.status];
            return (
              <div key={t.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: s.dot }} />
                <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {t.task_description.length > 60 ? t.task_description.slice(0, 60) + "…" : t.task_description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {total === 0 && (
        <p className="text-[11px] text-center py-2" style={{ color: "rgba(255,255,255,0.2)" }}>Henüz görev yok</p>
      )}
    </div>
  );
}

export default function AgentBoard({ tasks, loading, onRefresh }: Props) {
  const [filter, setFilter] = useState<"all" | "running" | "pending" | "completed">("all");

  const agents: AgentName[] = [
    "fullstack-gelistirici",
    "elektronik-muhendis",
    "tedarik-zinciri",
    "pazarlama-algi",
    "sosyal-medya",
    "veri-panel",
    "operasyon-otomasyon",
    "dokuman-yoneticisi",
    "pazar-stratejist",
  ];

  const tasksByAgent = (agent: AgentName) =>
    tasks.filter((t) => t.agent_name === agent &&
      (filter === "all" || t.status === filter));

  const quickUpdate = async (taskId: string, status: AgentTask["status"]) => {
    const db = supabaseService();
    await db.from("agent_tasks").update({
      status,
      ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
    }).eq("id", taskId);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <p className="text-xs tracking-[0.2em] mr-2" style={{ color: "rgba(255,255,255,0.4)" }}>AJANLAR</p>
        {(["all", "running", "pending", "completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-[10px] px-2.5 py-1 rounded-lg tracking-wider transition-all"
            style={{
              background: filter === f ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: filter === f ? "#00d4ff" : "rgba(255,255,255,0.4)",
            }}>
            {f === "all" ? "TÜMÜ" : f === "running" ? "AKTİF" : f === "pending" ? "BEKLEYEN" : "TAMAMLANDI"}
          </button>
        ))}
        <button onClick={onRefresh} className="ml-auto text-[10px] opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: "#fff" }}>
          ↻ YENİLE
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse h-32"
              style={{ background: "rgba(255,255,255,0.03)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <AgentCard key={agent} agent={agent} tasks={tasksByAgent(agent)} />
          ))}
        </div>
      )}
    </div>
  );
}
