import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { waitUntil } from "@vercel/functions";
import { VICTOR_SYSTEM_PROMPT } from "@/prompts/victor-system";
import type { ChatRequest } from "@/lib/types";

// Vercel function timeout (seconds) — Pro: 300, Hobby: 60
export const maxDuration = 60;

// Langfuse dynamic import — crash etmez, key yoksa null döner
async function createTrace(message: string, sessionId?: string) {
  const pk = process.env.LANGFUSE_PUBLIC_KEY;
  const sk = process.env.LANGFUSE_SECRET_KEY;
  if (!pk || !sk) return { trace: null, generation: null, flush: async () => {} };
  try {
    const { Langfuse } = await import("langfuse");
    const lf = new Langfuse({
      publicKey: pk,
      secretKey: sk,
      baseUrl: process.env.LANGFUSE_BASEURL ?? "https://cloud.langfuse.com",
      flushAt: 1,
      flushInterval: 0,
    });
    const trace = lf.trace({
      name: "victor-chat",
      input: message,
      metadata: { session_id: sessionId },
    });
    const generation = trace.generation({
      name: "claude-response",
      model: "claude-sonnet-4-6",
      input: message,
    });
    return {
      trace,
      generation,
      flush: () => lf.flushAsync().catch(() => {}),
    };
  } catch {
    return { trace: null, generation: null, flush: async () => {} };
  }
}

function friendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw.replace(/^[^{]*/, ""));
    const type = parsed?.error?.type ?? parsed?.type ?? "";
    if (type === "overloaded_error") return "Claude şu an çok yoğun. Birkaç saniye bekleyip tekrar deneyin.";
    if (type === "rate_limit_error")  return "İstek limiti aşıldı. Kısa bir süre bekleyin.";
    if (type === "authentication_error") return "API kimlik doğrulama hatası.";
    const msg = parsed?.error?.message ?? "";
    if (msg) return msg;
  } catch { /* JSON değil */ }
  return raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
}

const AGENT_NAMES = [
  "claude-code",
  "fullstack-gelistirici",
  "elektronik-muhendis",
  "tedarik-zinciri",
  "pazarlama-algi",
  "sosyal-medya",
  "veri-panel",
  "operasyon-otomasyon",
  "dokuman-yoneticisi",
  "pazar-stratejist",
] as const;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "create_agent_task",
    description:
      "Bir Şarjup ajanına görev ata. Kullanıcı bir ajana iş yaptırmak istediğinde bu tool'u çağır.",
    input_schema: {
      type: "object" as const,
      properties: {
        agent_name: { type: "string", enum: [...AGENT_NAMES] },
        task_description: { type: "string" },
        priority: { type: "string", enum: ["low", "normal", "high", "critical"] },
      },
      required: ["agent_name", "task_description"],
    },
  },
  {
    name: "get_agent_tasks",
    description:
      "Veritabanındaki ajan görevlerini getir. Durum sorgulamak, rapor almak, ne yapıldığını görmek için çağır. Hiçbir zaman 'erişimim yok' deme — bu tool ile ger çek veriyi çek.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["pending", "running", "completed", "failed", "cancelled", "all"],
          description: "Filtrelemek istenen durum. Tümü için 'all' kullan.",
        },
        agent_name: {
          type: "string",
          enum: [...AGENT_NAMES, "all"],
          description: "Belirli bir ajan için filtrele. Tümü için 'all'.",
        },
        limit: {
          type: "number",
          description: "Kaç görev dönsün (varsayılan: 20)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_task_result",
    description:
      "Belirli bir görevin tam sonucunu getir. Ajan ne yanıt verdi, ne üretiyor görmek için kullan.",
    input_schema: {
      type: "object" as const,
      properties: {
        task_id: { type: "string", description: "Görevin UUID'si" },
      },
      required: ["task_id"],
    },
  },
];

function getAppBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function executeCreateTask(input: Record<string, string>): Promise<string> {
  try {
    const { supabaseService } = await import("@/lib/supabase");
    const { agent_name, task_description, priority = "normal" } = input;
    const db = supabaseService();

    const { data: task, error } = await db
      .from("agent_tasks")
      .insert({ agent_name, task_description, priority, status: "pending", assigned_by: "victor" })
      .select()
      .single();

    if (error) return `Görev oluşturulamadı: ${error.message}`;

    await db.from("agent_activity").insert({
      agent_name,
      action: `Victor görev atadı: ${task_description.slice(0, 60)}`,
      task_id: task.id,
      details: { priority, source: "victor_chat" },
    });

    if (agent_name !== "claude-code") {
      // claude-code görevlerini yerel worker alır — execute endpoint'i çağırma
      waitUntil(
        fetch(`${getAppBaseUrl()}/api/agents/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_id: task.id }),
        }).catch(() => {})
      );
    }

    const workerNote = agent_name === "claude-code"
      ? "Yerel Claude Code worker alacak — panelin terminal sekmesinden takip edebilirsiniz."
      : "Panelden takip edebilirsiniz.";

    return `Görev oluşturuldu. ${workerNote}`;
  } catch (e) {
    return `Görev kaydedilemedi: ${e instanceof Error ? e.message : "bilinmeyen hata"}`;
  }
}

async function executeGetAgentTasks(input: Record<string, string | number>): Promise<string> {
  try {
    const { supabaseService } = await import("@/lib/supabase");
    const db = supabaseService();

    const statusFilter  = (input.status as string)  || "all";
    const agentFilter   = (input.agent_name as string) || "all";
    const limit         = Number(input.limit) || 20;

    let query = db
      .from("agent_tasks")
      .select("id, agent_name, task_description, status, priority, result, created_at, completed_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (agentFilter  !== "all") query = query.eq("agent_name", agentFilter);

    const { data, error } = await query;
    if (error) return `Görevler alınamadı: ${error.message}`;
    if (!data?.length) return "Belirtilen kriterlerde görev bulunamadı.";

    const lines = data.map((t) => {
      const resultPreview = t.result
        ? ` → Sonuç: ${(t.result as string).slice(0, 120)}${(t.result as string).length > 120 ? "…" : ""}`
        : "";
      const age = Math.floor((Date.now() - new Date(t.created_at as string).getTime()) / 60000);
      const ageStr = age < 60 ? `${age}dk` : `${Math.floor(age / 60)}sa`;
      return `[${(t.status as string).toUpperCase()}] ${t.agent_name} | ${t.task_description?.toString().slice(0, 70)} (${ageStr} önce)${resultPreview}`;
    });

    const summary = [
      `Toplam ${data.length} görev:`,
      ...lines,
    ].join("\n");

    return summary;
  } catch (e) {
    return `Görevler alınamadı: ${e instanceof Error ? e.message : "bilinmeyen hata"}`;
  }
}

async function executeGetTaskResult(input: Record<string, string>): Promise<string> {
  try {
    const { task_id } = input;
    if (!task_id) return "task_id belirtilmedi.";

    const { supabaseService } = await import("@/lib/supabase");
    const db = supabaseService();

    const { data, error } = await db
      .from("agent_tasks")
      .select("*")
      .eq("id", task_id)
      .single();

    if (error || !data) return "Görev bulunamadı.";

    return [
      `Ajan: ${data.agent_name}`,
      `Görev: ${data.task_description}`,
      `Durum: ${data.status}`,
      `Öncelik: ${data.priority}`,
      `Oluşturulma: ${new Date(data.created_at as string).toLocaleString("tr-TR")}`,
      data.completed_at ? `Tamamlanma: ${new Date(data.completed_at as string).toLocaleString("tr-TR")}` : "",
      "",
      "Sonuç:",
      (data.result as string) ?? "(henüz sonuç yok)",
    ]
      .filter(Boolean)
      .join("\n");
  } catch (e) {
    return `Görev detayı alınamadı: ${e instanceof Error ? e.message : "bilinmeyen hata"}`;
  }
}

const TOOL_EXECUTORS: Record<
  string,
  (input: Record<string, string | number>) => Promise<string>
> = {
  create_agent_task: executeCreateTask as (input: Record<string, string | number>) => Promise<string>,
  get_agent_tasks:   executeGetAgentTasks,
  get_task_result:   executeGetTaskResult as (input: Record<string, string | number>) => Promise<string>,
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY eksik." }, { status: 500 });
    }

    const body: ChatRequest = await req.json();
    const { message, history, session_id } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey,
      maxRetries: 3,      // overloaded_error dahil geçici hatalarda 3x retry
      timeout: 55_000,    // 55sn (maxDuration=60 altında kalır)
    });

    const claudeMessages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    // Langfuse trace (dynamic import — hata olsa bile cevabı engellemez)
    const { trace, generation, flush } = await createTrace(message, session_id);

    // Fire-and-forget: Supabase kayıt
    if (session_id) {
      import("@/lib/supabase").then(({ supabaseService }) => {
        supabaseService()
          .from("victor_messages")
          .insert({ role: "user", content: message, session_id, trace_id: trace?.id })
          .then(() => {});
      }).catch(() => {});
    }

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: VICTOR_SYSTEM_PROMPT,
      messages: claudeMessages,
      tools: TOOLS,
    });

    let fullTextReply  = "";
    let toolUseId      = "";
    let toolName       = "";
    let toolInputStr   = "";
    let toolUsed: Record<string, string> | null = null;

    const readable = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();

        try {
          for await (const event of stream) {
            if (event.type === "content_block_start") {
              if (event.content_block.type === "tool_use") {
                toolUseId    = event.content_block.id;
                toolName     = event.content_block.name;
                toolInputStr = "";
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                fullTextReply += event.delta.text;
                controller.enqueue(enc.encode(event.delta.text));
              } else if (event.delta.type === "input_json_delta") {
                toolInputStr += event.delta.partial_json;
              }
            } else if (event.type === "content_block_stop" && toolUseId) {
              try {
                toolUsed = JSON.parse(toolInputStr || "{}") as Record<string, string>;
              } catch {
                toolUsed = {};
              }
            }
          }

          const finalMsg = await stream.finalMessage();

          // Tool çalıştır ve follow-up al
          const executor = TOOL_EXECUTORS[toolName];
          if (finalMsg.stop_reason === "tool_use" && toolUsed && executor) {
            const toolResult = await executor(toolUsed as Record<string, string | number>);

            const followUp = await anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 512,
              system: VICTOR_SYSTEM_PROMPT,
              messages: [
                ...claudeMessages,
                { role: "assistant", content: finalMsg.content },
                {
                  role: "user",
                  content: [{ type: "tool_result", tool_use_id: toolUseId, content: toolResult }],
                },
              ],
            });

            const followUpText = followUp.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map((b) => b.text)
              .join("");

            controller.enqueue(enc.encode(followUpText));
            fullTextReply += followUpText;
          }

          controller.close();

          // Langfuse: generation kapat + flush
          const usage = finalMsg.usage;
          generation?.end({
            output: fullTextReply,
            usage: { input: usage.input_tokens, output: usage.output_tokens },
          });
          trace?.update({ output: fullTextReply });
          await flush();

          // Fire-and-forget: asistan cevabını kaydet
          if (session_id && fullTextReply) {
            import("@/lib/supabase").then(({ supabaseService }) => {
              supabaseService()
                .from("victor_messages")
                .insert({ role: "assistant", content: fullTextReply, session_id, trace_id: trace?.id })
                .then(() => {});
            }).catch(() => {});
          }

        } catch (err) {
          console.error("[chat/stream]", err);
          if (!fullTextReply) {
            const friendlyMsg = friendlyError(err);
            controller.enqueue(enc.encode(friendlyMsg));
          }
          controller.close();
        }
      },
      cancel() { stream.abort(); },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sunucu hatası." },
      { status: 500 },
    );
  }
}
