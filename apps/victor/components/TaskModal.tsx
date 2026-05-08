"use client";

import { useState } from "react";
import type { AgentName, TaskPriority } from "@/lib/types";
import { AGENT_META } from "@/lib/types";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const AGENTS: AgentName[] = [
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

export default function TaskModal({ onClose, onCreated }: Props) {
  const [agent, setAgent]       = useState<AgentName>("fullstack-gelistirici");
  const [desc, setDesc]         = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [saving, setSaving]     = useState(false);

  const save = async () => {
    if (!desc.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/agents/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_name: agent,
          task_description: desc,
          priority,
          assigned_by: "manuel",
        }),
      });
      onCreated();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "#111120", border: "1px solid rgba(0,212,255,0.2)" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest" style={{ color: "#00d4ff" }}>YENİ GÖREV</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-70 transition-opacity text-lg leading-none">×</button>
        </div>

        {/* Agent */}
        <div>
          <label className="block text-[10px] tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>AJAN</label>
          <div className="grid grid-cols-3 gap-2">
            {AGENTS.map((a) => {
              const m = AGENT_META[a];
              return (
                <button key={a} onClick={() => setAgent(a)}
                  className="rounded-xl p-2 text-center text-[10px] tracking-wide transition-all"
                  style={{
                    background: agent === a ? `${m.color}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${agent === a ? m.color + "50" : "rgba(255,255,255,0.06)"}`,
                    color: agent === a ? m.color : "rgba(255,255,255,0.4)",
                  }}>
                  <span className="block text-sm mb-0.5">{m.icon}</span>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>GÖREV TANIMI</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Görevin ne olduğunu yaz..."
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8e8f0",
            }}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[10px] tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>ÖNCELİK</label>
          <div className="flex gap-2">
            {(["low", "normal", "high", "critical"] as TaskPriority[]).map((p) => {
              const colors: Record<TaskPriority, string> = {
                low: "#6b7280", normal: "#3b82f6", high: "#f59e0b", critical: "#ef4444",
              };
              const labels: Record<TaskPriority, string> = {
                low: "Düşük", normal: "Normal", high: "Yüksek", critical: "KRİTİK",
              };
              return (
                <button key={p} onClick={() => setPriority(p)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] tracking-wide transition-all"
                  style={{
                    background: priority === p ? `${colors[p]}20` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${priority === p ? colors[p] + "60" : "rgba(255,255,255,0.06)"}`,
                    color: priority === p ? colors[p] : "rgba(255,255,255,0.35)",
                  }}>
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={save} disabled={saving || !desc.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold tracking-widest transition-all disabled:opacity-40"
          style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)", color: "#00d4ff" }}>
          {saving ? "KAYDEDİLİYOR..." : "GÖREVI OLUŞTUR"}
        </button>
      </div>
    </div>
  );
}
