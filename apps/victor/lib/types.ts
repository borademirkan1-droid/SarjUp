export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type AppStatus =
  | "off"
  | "passive"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface TranscribeResponse {
  text: string;
}

export interface ChatRequest {
  message: string;
  history: { role: MessageRole; content: string }[];
  session_id?: string;
}

export interface ChatResponse {
  reply: string;
}

export interface SpeakRequest {
  text: string;
}

// Ajan tabloları
export type AgentName =
  | "claude-code"
  | "fullstack-gelistirici"
  | "elektronik-muhendis"
  | "tedarik-zinciri"
  | "pazarlama-algi"
  | "sosyal-medya"
  | "veri-panel"
  | "operasyon-otomasyon"
  | "dokuman-yoneticisi"
  | "pazar-stratejist"
  | "victor";

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface AgentTask {
  id: string;
  agent_name: AgentName;
  task_description: string;
  status: TaskStatus;
  priority: TaskPriority;
  result?: string;
  assigned_by: string;
  trace_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AgentActivity {
  id: string;
  agent_name: AgentName;
  action: string;
  details: Record<string, unknown>;
  task_id?: string;
  trace_id?: string;
  created_at: string;
}

export interface VictorMessage {
  id: string;
  role: MessageRole;
  content: string;
  session_id?: string;
  trace_id?: string;
  created_at: string;
}

export const AGENT_META: Record<AgentName, { label: string; color: string; icon: string }> = {
  "claude-code":            { label: "Claude Code",   color: "#00d4ff", icon: "◆" },
  "fullstack-gelistirici":  { label: "Fullstack",     color: "#3b82f6", icon: "⚡" },
  "elektronik-muhendis":   { label: "Elektronik",    color: "#8b5cf6", icon: "🔌" },
  "tedarik-zinciri":       { label: "Tedarik",        color: "#f59e0b", icon: "📦" },
  "pazarlama-algi":        { label: "Pazarlama",      color: "#ec4899", icon: "📢" },
  "sosyal-medya":          { label: "Sosyal Medya",   color: "#06b6d4", icon: "📱" },
  "veri-panel":            { label: "Veri",           color: "#10b981", icon: "📊" },
  "operasyon-otomasyon":   { label: "Operasyon",      color: "#f97316", icon: "⚙️" },
  "dokuman-yoneticisi":    { label: "Döküman",        color: "#6366f1", icon: "📄" },
  "pazar-stratejist":      { label: "Strateji",       color: "#84cc16", icon: "🎯" },
  "victor":                { label: "Victor",         color: "#00d4ff", icon: "V" },
};
