"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import AgentPanel from "@/components/AgentPanel";

export default function Home() {
  const [tab, setTab] = useState<"chat" | "agents">("chat");

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0c0c14" }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-5"
        style={{ height: 52, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.18)", color: "#00d4ff" }}>
          V
        </div>
        <span className="font-semibold text-sm" style={{ color: "#e0e0f0" }}>Victor</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", color: "#22c55e" }}>
          çevrimiçi
        </span>
      </header>

      {/* Gövde */}
      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* Ajan paneli
            - Mobil: sadece "agents" sekmesinde görünür
            - Masaüstü: daima görünür (md:flex override)           */}
        <div
          className={`flex-col overflow-hidden flex-shrink-0 ${tab === "agents" ? "flex" : "hidden"} md:flex`}
          style={{ width: "55%", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <AgentPanel />
        </div>

        {/* Sohbet paneli
            - Mobil: sadece "chat" sekmesinde görünür
            - Masaüstü: daima görünür (md:flex override)           */}
        <div
          className={`flex-col overflow-hidden flex-1 min-w-0 ${tab === "chat" ? "flex" : "hidden"} md:flex`}>
          <ChatPanel />
        </div>
      </div>

      {/* Mobil sekme çubuğu */}
      <nav className="flex-shrink-0 flex md:hidden"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#0c0c14",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
        {([
          { key: "chat",   label: "Sohbet",  Icon: ChatIcon },
          { key: "agents", label: "Ajanlar", Icon: GridIcon },
        ] as const).map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors"
            style={{ color: tab === key ? "#00d4ff" : "#363650" }}>
            <Icon active={tab === key} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#00d4ff" : "#363650"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#00d4ff" : "#363650"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
