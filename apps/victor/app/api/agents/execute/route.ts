import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPTS, AGENT_TOOLS } from "@/prompts/agents";

export const maxDuration = 60;

// ─── Tool Executor ────────────────────────────────────────────────────────────

async function executeTool(
  toolName: string,
  toolInput: Record<string, string>
): Promise<string> {
  if (toolName === "web_search") {
    const query = toolInput.query;
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: 5,
          search_depth: "basic",
        }),
      });
      if (!res.ok) throw new Error(`Tavily API ${res.status}`);
      const data = await res.json() as {
        results?: Array<{ title: string; content: string; url: string }>
      };
      const results = data.results ?? [];
      return results
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.content.slice(0, 200)}\n   ${r.url}`)
        .join("\n\n") || "Sonuç bulunamadı.";
    } catch (e) {
      return `Arama hatası: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  if (toolName === "supabase_query") {
    const { supabaseService } = await import("@/lib/supabase");
    const db = supabaseService();
    const { table, filter, limit } = toolInput;
    try {
      let q = db.from(table).select("*");
      if (filter) q = q.eq(filter.split("=")[0], filter.split("=")[1]);
      if (limit) q = q.limit(parseInt(limit));
      const { data, error } = await q;
      if (error) return `Sorgu hatası: ${error.message}`;
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return `Sorgu hatası: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return `Bilinmeyen tool: ${toolName}`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let task_id: string | undefined;
  try {
    const body = await req.json();
    task_id = body.task_id;
    if (!task_id) return NextResponse.json({ error: "task_id zorunlu" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { supabaseService } = await import("@/lib/supabase");
  const db = supabaseService();

  const { data: task, error: fetchErr } = await db
    .from("agent_tasks").select("*").eq("id", task_id).single();

  if (fetchErr || !task) return NextResponse.json({ error: "Görev bulunamadı" }, { status: 404 });
  if (task.agent_name === "claude-code") {
    return NextResponse.json({ error: "claude-code görevleri yerel worker tarafından işlenir" }, { status: 409 });
  }
  if (task.status !== "pending") return NextResponse.json({ error: `Görev zaten ${task.status}` }, { status: 409 });

  await db.from("agent_tasks").update({ status: "running" }).eq("id", task_id);
  await db.from("agent_activity").insert({
    agent_name: task.agent_name,
    action: "Çalışmaya başladı",
    task_id,
    details: { status: "running" },
  });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY eksik");

    const anthropic = new Anthropic({ apiKey, maxRetries: 2, timeout: 55_000 });
    const systemPrompt = AGENT_SYSTEM_PROMPTS[task.agent_name as string]
      ?? "Sen Şarjup projesinde çalışan bir AI ajanısın.";
    const tools = AGENT_TOOLS[task.agent_name as string] ?? [];

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: task.task_description as string },
    ];

    let result = "";
    let continueLoop = true;
    let lastSavedLen = 0;
    const UPDATE_EVERY = 180;

    while (continueLoop) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        messages,
      });

      // Metin bloklarını topla
      for (const block of response.content) {
        if (block.type === "text") {
          result += block.text + "\n";
          if (result.length - lastSavedLen >= UPDATE_EVERY) {
            lastSavedLen = result.length;
            await db.from("agent_tasks").update({ result }).eq("id", task_id);
          }
        }
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );

        const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
          toolUses.map(async (tu) => ({
            type: "tool_result" as const,
            tool_use_id: tu.id,
            content: await executeTool(tu.name, tu.input as Record<string, string>),
          }))
        );

        await db.from("agent_tasks").update({ result }).eq("id", task_id);
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
      } else {
        continueLoop = false;
      }
    }

    await db.from("agent_tasks")
      .update({ status: "completed", result, completed_at: new Date().toISOString() })
      .eq("id", task_id);

    await db.from("agent_activity").insert({
      agent_name: task.agent_name,
      action: "Görev tamamlandı",
      task_id,
      details: { result_preview: result.slice(0, 120) },
    });

    return NextResponse.json({ success: true, result });

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Bilinmeyen hata";
    await db.from("agent_tasks").update({ status: "failed", result: errMsg }).eq("id", task_id);
    await db.from("agent_activity").insert({
      agent_name: task.agent_name,
      action: `Görev başarısız: ${errMsg.slice(0, 60)}`,
      task_id,
      details: { error: errMsg },
    });
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
