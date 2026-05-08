"use client";

import { useState, useEffect, useCallback } from "react";
import AgentBoard from "@/components/AgentBoard";
import ActivityFeed from "@/components/ActivityFeed";
import VictorHistory from "@/components/VictorHistory";
import TaskModal from "@/components/TaskModal";
import { supabase } from "@/lib/supabase";
import type { AgentTask, AgentActivity } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks]       = useState<AgentTask[]>([]);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [loading, setLoading]   = useState(true);
  const [newTask, setNewTask]   = useState(false);

  const load = useCallback(async () => {
    const [t, a] = await Promise.all([
      supabase.from("agent_tasks").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("agent_activity").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (t.data) setTasks(t.data as AgentTask[]);
    if (a.data) setActivity(a.data as AgentActivity[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const taskSub = supabase
      .channel("agent_tasks_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_tasks" }, () => load())
      .subscribe();

    const actSub = supabase
      .channel("agent_activity_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_activity" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(taskSub);
      supabase.removeChannel(actSub);
    };
  }, [load]);

  const running  = tasks.filter((t) => t.status === "running").length;
  const done     = tasks.filter((t) => t.status === "completed").length;
  const pending  = tasks.filter((t) => t.status === "pending").length;
  const failed   = tasks.filter((t) => t.status === "failed").length;

  return (
    <div className="min-h-screen" style={{ background: "#080810", color: "#e8e8f0" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(0,212,255,0.12)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-sm">
            <span style={{ color: "#00d4ff" }}>←</span>
            <span className="text-xs tracking-widest" style={{ color: "#00d4ff" }}>VICTOR</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <h1 className="text-sm font-semibold tracking-[0.2em]" style={{ color: "#e8e8f0" }}>KONTROL MERKEZİ</h1>
        </div>
        <button
          onClick={() => setNewTask(true)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium tracking-wider transition-all active:scale-95"
          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
          + YENİ GÖREV
        </button>
      </header>

      {/* KPI Bar */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2">
        {[
          { label: "ÇALIŞIYOR", value: running,  color: "#00d4ff" },
          { label: "BEKLEYEN",  value: pending,   color: "#ffa500" },
          { label: "TAMAMLANDI", value: done,     color: "#00ff9d" },
          { label: "HATA",      value: failed,    color: "#ff4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] tracking-[0.15em] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Board */}
        <div className="lg:col-span-2">
          <AgentBoard tasks={tasks} loading={loading} onRefresh={load} />
        </div>

        {/* Right Column: Activity + Victor History */}
        <div className="flex flex-col gap-4">
          <ActivityFeed activity={activity} />
          <VictorHistory />
        </div>
      </div>

      {newTask && <TaskModal onClose={() => setNewTask(false)} onCreated={load} />}
    </div>
  );
}
