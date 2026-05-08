"use client";

import type { AgentActivity, AgentName } from "@/lib/types";
import { AGENT_META } from "@/lib/types";

interface Props {
  activity: AgentActivity[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins}d önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}s önce`;
  return `${Math.floor(hrs / 24)}g önce`;
}

export default function ActivityFeed({ activity }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>

      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs tracking-[0.2em] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
          AKTİVİTE AKIŞI
        </p>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{activity.length} kayıt</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {activity.length === 0 && (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Henüz aktivite yok</p>
          </div>
        )}
        {activity.map((item) => {
          const meta = AGENT_META[item.agent_name as AgentName] ?? { color: "#888", label: item.agent_name, icon: "?" };
          return (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px]"
                style={{ background: `${meta.color}18`, color: meta.color }}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-[10px] font-semibold tracking-wider truncate" style={{ color: meta.color }}>
                    {meta.label.toUpperCase()}
                  </p>
                  <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {item.action}
                </p>
                {item.details && Object.keys(item.details).length > 0 && (
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {JSON.stringify(item.details).slice(0, 80)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
