"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { AgentTask, AgentActivity, AgentName } from "@/lib/types";
import { AGENT_META } from "@/lib/types";
import TaskModal from "@/components/TaskModal";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

const STATUS_COLORS: Record<string, string> = {
  running:   "#22c55e",
  pending:   "#f59e0b",
  completed: "#6366f1",
  failed:    "#ef4444",
  cancelled: "#06b6d4",
  idle:      "#2d2d3a",
};

const STATUS_LABELS: Record<string, string> = {
  running:   "Çalışıyor",
  pending:   "Bekliyor",
  completed: "Bitti",
  failed:    "Hata",
  cancelled: "Düzeltildi",
  idle:      "Boşta",
};

function ResultModal({
  task,
  onClose,
  onRetry,
}: {
  task: AgentTask;
  onClose: () => void;
  onRetry: (t: AgentTask) => Promise<void>;
}) {
  const meta = AGENT_META[task.agent_name];
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await onRetry(task);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          background: "#111120",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-xl">{meta?.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#e0e0f0" }}>
              {meta?.label}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "#505068" }}>
              {task.task_description}
            </p>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `${STATUS_COLORS[task.status]}18`,
              color: STATUS_COLORS[task.status],
              border: `1px solid ${STATUS_COLORS[task.status]}30`,
            }}
          >
            {STATUS_LABELS[task.status]}
          </span>
          <button
            onClick={onClose}
            className="opacity-40 hover:opacity-70 transition-opacity text-xl leading-none ml-1"
          >
            ×
          </button>
        </div>

        {/* Result */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {task.result ? (
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#c0c0d8" }}
            >
              {task.result}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#505068" }}>
              {task.status === "running"
                ? "Ajan çalışıyor..."
                : task.status === "pending"
                ? "Sırada bekliyor..."
                : "Sonuç yok."}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex-shrink-0 flex justify-between items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-[10px]" style={{ color: "#363650" }}>
            {new Date(task.created_at).toLocaleString("tr-TR")}
          </span>
          <div className="flex gap-2">
            {task.status === "failed" && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="text-[10px] px-3 py-1 rounded-lg transition-all disabled:opacity-40"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#22c55e",
                }}
              >
                {retrying ? "Atanıyor..." : "↺ Yeniden Çalıştır"}
              </button>
            )}
            {task.result && (
              <button
                onClick={() => navigator.clipboard.writeText(task.result ?? "")}
                className="text-[10px] px-3 py-1 rounded-lg transition-all"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#6366f1",
                }}
              >
                Kopyala
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPanel() {
  const [tasks, setTasks]               = useState<AgentTask[]>([]);
  const [showModal, setShowModal]       = useState(false);
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [activeTab, setActiveTab]       = useState<AgentName | null>(null);

  const load = useCallback(async () => {
    const [t] = await Promise.all([
      supabase
        .from("agent_tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (t.data) setTasks(t.data as AgentTask[]);
  }, []);

  useEffect(() => {
    load();
    const sub = supabase
      .channel("ap_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_tasks" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_activity" }, load)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [load]);

  // Seçili task'ı canlı güncelle
  useEffect(() => {
    if (!selectedTask) return;
    const updated = tasks.find((t) => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Terminal aktif tab: en son çalışan/çalışmış ajan
  useEffect(() => {
    const agents = (Object.keys(AGENT_META) as AgentName[]).filter((k) => k !== "victor");
    const tabAgents = agents.filter((name) =>
      tasks.some((t) => t.agent_name === name)
    );
    if (tabAgents.length === 0) return;
    if (activeTab && tabAgents.some((a) => a === activeTab)) return;
    // En son görevi olan ajanı seç
    const sorted = tabAgents.slice().sort((a, b) => {
      const ta = tasks.find((t) => t.agent_name === a);
      const tb = tasks.find((t) => t.agent_name === b);
      if (!ta) return 1;
      if (!tb) return -1;
      return new Date(tb.created_at).getTime() - new Date(ta.created_at).getTime();
    });
    setActiveTab(sorted[0]);
  }, [tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  const retryTask = useCallback(async (failed: AgentTask) => {
    await fetch("/api/agents/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: failed.id, status: "cancelled" }),
    });
    await fetch("/api/agents/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_name: failed.agent_name,
        task_description: failed.task_description,
        priority: failed.priority,
        assigned_by: "retry",
      }),
    });
    await load();
  }, [load]);

  const agents = (Object.keys(AGENT_META) as AgentName[]).filter((k) => k !== "victor");

  const getAgentInfo = (name: AgentName) => {
    const running = tasks.find((t) => t.agent_name === name && t.status === "running");
    const pending = tasks.find((t) => t.agent_name === name && t.status === "pending");
    if (running) return { status: "running", task: running };
    if (pending) return { status: "pending", task: pending };
    const lastDone = tasks.find((t) => t.agent_name === name && t.status === "completed");
    const done = tasks.filter((t) => t.agent_name === name && t.status === "completed").length;
    return { status: "idle" as const, task: lastDone ?? null, doneCount: done };
  };

  const kpis = [
    { label: "Aktif",      value: tasks.filter((t) => t.status === "running").length,   color: "#22c55e" },
    { label: "Bekleyen",   value: tasks.filter((t) => t.status === "pending").length,   color: "#f59e0b" },
    { label: "Tamamlanan", value: tasks.filter((t) => t.status === "completed").length, color: "#6366f1" },
    { label: "Hata",       value: tasks.filter((t) => t.status === "failed").length,    color: "#ef4444" },
    { label: "Düzeltilen", value: tasks.filter((t) => t.status === "cancelled").length, color: "#06b6d4" },
  ];

  // Terminal için: en az 1 görevi olan ajanlar
  const terminalAgents = agents.filter((name) =>
    tasks.some((t) => t.agent_name === name)
  );

  // Aktif tab'ın son görevi
  const activeTask = activeTab
    ? tasks.find((t) => t.agent_name === activeTab) ?? null
    : null;

  // Tab dot rengi
  function tabDotColor(name: AgentName): { color: string; pulse: boolean } {
    const running = tasks.some((t) => t.agent_name === name && (t.status === "running" || t.status === "pending"));
    const failed  = tasks.find((t) => t.agent_name === name)?.status === "failed";
    if (running) return { color: "#f59e0b", pulse: true };
    if (failed)  return { color: "#ef4444", pulse: false };
    return { color: "#22c55e", pulse: false };
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-sm font-medium" style={{ color: "#c0c0d8" }}>
          Ajan Ekibi
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.18)",
            color: "#00d4ff",
          }}
        >
          + Görev
        </button>
      </div>

      {/* Üst bölüm: KPI + ajan grid — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 min-h-0">
        {/* KPI — 5 kart, 2 satır (3+2) */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {kpis.slice(0, 3).map((k) => (
              <div
                key={k.label}
                className="rounded-xl p-3 text-center"
                style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-lg font-semibold leading-none" style={{ color: k.color }}>
                    {k.value}
                  </p>
                  {k.label === "Aktif" && k.value > 0 && (
                    <span
                      className="w-3 h-3 rounded-full border border-t-transparent animate-spin flex-shrink-0"
                      style={{ borderColor: "#22c55e", borderTopColor: "transparent" }}
                    />
                  )}
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "#505068" }}>
                  {k.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {kpis.slice(3).map((k) => (
              <div
                key={k.label}
                className="rounded-xl p-3 text-center"
                style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-lg font-semibold leading-none" style={{ color: k.color }}>
                  {k.value}
                </p>
                <p className="text-[10px] mt-1.5" style={{ color: "#505068" }}>
                  {k.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent grid */}
        <div>
          <p className="text-xs font-medium mb-3" style={{ color: "#505068" }}>
            Ajanlar
          </p>
          <div className="grid grid-cols-3 gap-2">
            {agents.map((name) => {
              const meta = AGENT_META[name];
              const info = getAgentInfo(name);
              const isClickable = !!info.task;
              return (
                <div
                  key={name}
                  onClick={() => isClickable && setSelectedTask(info.task as AgentTask)}
                  className={`rounded-xl p-3 ${isClickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                  style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-base leading-none">{meta.icon}</span>
                    <span
                      className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: `${STATUS_COLORS[info.status]}18`,
                        color: STATUS_COLORS[info.status],
                        border: `1px solid ${STATUS_COLORS[info.status]}30`,
                      }}
                    >
                      {info.status === "running" && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-t-transparent animate-spin inline-block flex-shrink-0"
                          style={{ borderColor: "#22c55e", borderTopColor: "transparent" }}
                        />
                      )}
                      {info.status !== "running" && STATUS_LABELS[info.status]}
                      {info.status === "running" && "Çalışıyor"}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-snug" style={{ color: "#b0b0c8" }}>
                    {meta.label}
                  </p>
                  {"doneCount" in info && info.doneCount && info.doneCount > 0 ? (
                    <p className="text-[10px] mt-1 leading-tight" style={{ color: "#505068" }}>
                      {info.doneCount} görev tamamlandı
                    </p>
                  ) : info.task ? (
                    <p className="text-[10px] mt-1 leading-tight line-clamp-2" style={{ color: "#505068" }}>
                      {(info.task as AgentTask).task_description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terminal — sabit alt bölüm, 260px */}
      <div
        className="flex-shrink-0"
        style={{
          height: 260,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          background: "#080810",
        }}
      >
        {/* Sekme satırı */}
        <div
          className="flex-shrink-0 flex items-center gap-0 overflow-x-auto"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            scrollbarWidth: "none",
            minHeight: 36,
          }}
        >
          {terminalAgents.length === 0 ? (
            <span className="px-4 text-[10px]" style={{ color: "#363650" }}>
              Terminal
            </span>
          ) : (
            terminalAgents.map((name) => {
              const meta = AGENT_META[name];
              const dot  = tabDotColor(name);
              const isActive = activeTab === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveTab(name)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] flex-shrink-0 transition-colors"
                  style={{
                    color: isActive ? "#c0c0d8" : "#505068",
                    background: isActive ? "rgba(37,99,235,0.10)" : "transparent",
                    borderRight: "1px solid rgba(255,255,255,0.04)",
                    outline: "none",
                  }}
                >
                  <span className="leading-none">{meta.icon}</span>
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${dot.pulse ? "animate-pulse" : ""}`}
                    style={{ background: dot.color }}
                  />
                  <span className="truncate max-w-[64px]">{meta.label}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Terminal içeriği */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 11,
            lineHeight: "1.6",
            color: "#22c55e",
            background: "#080810",
          }}
        >
          {terminalAgents.length === 0 || !activeTask ? (
            <span style={{ color: "#2a2a40" }}>
              Boşta — görev bekleniyor
            </span>
          ) : (
            <>
              <div style={{ color: "#4ade80", marginBottom: 6 }}>
                $ {AGENT_META[activeTask.agent_name]?.label ?? activeTask.agent_name}{" "}
                → {activeTask.task_description.slice(0, 80)}
                {activeTask.task_description.length > 80 ? "…" : ""}
              </div>
              {activeTask.result ? (
                <div className="whitespace-pre-wrap" style={{ color: "#22c55e" }}>
                  {activeTask.result}
                  {(activeTask.status === "running" || activeTask.status === "pending") && (
                    <span className="animate-pulse" style={{ color: "#22c55e" }}>█</span>
                  )}
                </div>
              ) : (
                <div>
                  {(activeTask.status === "running" || activeTask.status === "pending") ? (
                    <span>
                      <span style={{ color: "#505068" }}>Çalışıyor</span>
                      <span className="animate-pulse" style={{ color: "#22c55e" }}>█</span>
                    </span>
                  ) : activeTask.status === "failed" ? (
                    <span style={{ color: "#ef4444" }}>
                      Hata: {activeTask.result ?? "Bilinmeyen hata"}
                    </span>
                  ) : (
                    <span style={{ color: "#2a2a40" }}>Sonuç yok.</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
      {selectedTask && (
        <ResultModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onRetry={retryTask}
        />
      )}
    </div>
  );
}
