"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { VictorMessage } from "@/lib/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins}d`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}s`;
  return `${Math.floor(hrs / 24)}g`;
}

export default function VictorHistory() {
  const [messages, setMessages] = useState<VictorMessage[]>([]);

  const load = useCallback(async () => {
    const db = getSupabase();
    const { data } = await db
      .from("victor_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setMessages(data as VictorMessage[]);
  }, []);

  useEffect(() => {
    load();
    const sub = getSupabase()
      .channel("victor_messages_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "victor_messages" }, () => load())
      .subscribe();
    return () => { getSupabase().removeChannel(sub); };
  }, [load]);

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.12)" }}>

      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
            V
          </div>
          <p className="text-xs tracking-[0.2em] font-semibold" style={{ color: "rgba(0,212,255,0.8)" }}>
            VICTOR GEÇMİŞİ
          </p>
        </div>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{messages.length} mesaj</span>
      </div>

      <div className="overflow-y-auto max-h-72 divide-y divide-white/5">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Henüz konuşma yok</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="px-4 py-2.5 flex items-start gap-2.5">
            <span className="shrink-0 text-[10px] font-semibold mt-0.5 w-12"
              style={{ color: msg.role === "user" ? "rgba(255,255,255,0.4)" : "#00d4ff" }}>
              {msg.role === "user" ? "SEN" : "VICTOR"}
            </span>
            <p className="flex-1 text-[11px] leading-snug truncate"
              style={{ color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)" }}>
              {msg.content}
            </p>
            <span className="shrink-0 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              {timeAgo(msg.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
