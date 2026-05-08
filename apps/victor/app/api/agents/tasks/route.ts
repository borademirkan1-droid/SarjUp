import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseService } from "@/lib/supabase";
import type { AgentName, TaskPriority } from "@/lib/types";

function getAppBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function GET() {
  const db = supabaseService();
  const { data, error } = await db
    .from("agent_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agent_name, task_description, priority = "normal", assigned_by = "victor" } = body;

  if (!agent_name || !task_description) {
    return NextResponse.json({ error: "agent_name ve task_description zorunlu" }, { status: 400 });
  }

  const db = supabaseService();

  const { data: task, error } = await db
    .from("agent_tasks")
    .insert({ agent_name, task_description, priority, assigned_by, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("agent_activity").insert({
    agent_name,
    action: `Görev oluşturuldu: ${task_description.slice(0, 60)}`,
    task_id: task.id,
    details: { priority, assigned_by },
  });

  // claude-code görevleri yerel worker tarafından alınır
  if (agent_name !== "claude-code") {
    waitUntil(
      fetch(`${getAppBaseUrl()}/api/agents/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: task.id }),
      }).catch(() => {})
    );
  }

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, result } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id ve status zorunlu" }, { status: 400 });
  }

  const db = supabaseService();
  const update: Record<string, unknown> = { status };
  if (result) update.result = result;
  if (status === "completed" || status === "failed") {
    update.completed_at = new Date().toISOString();
  }

  const { data, error } = await db
    .from("agent_tasks")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("agent_activity").insert({
    agent_name: data.agent_name,
    action: `Görev durumu: ${status}`,
    task_id: id,
    details: { result: result?.slice(0, 100) },
  });

  return NextResponse.json(data);
}
