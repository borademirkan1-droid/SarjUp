/**
 * Claude Code Local Worker
 * Çalıştır: npm run worker
 *
 * Victor panelinden gelen "claude-code" görevlerini alır,
 * dosya okuma/yazma ve terminal komutları ile gerçekleştirir,
 * sonuçları Supabase'e akıtır — panel terminalde canlı görünür.
 */

import * as fsSync from "fs";
// Load .env.local before anything else
(function loadEnv() {
  try {
    const lines = fsSync.readFileSync(
      new URL("../.env.local", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
      "utf8"
    ).split("\n");
    for (const line of lines) {
      const m = line.match(/^([A-Z][A-Z0-9_]*)=(.+)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch { /* .env.local yoksa sessizce geç */ }
})();

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

const PROJECTS_BASE = "C:\\Users\\Bora\\Projects";

const PROJECTS: Record<string, string> = {
  "victor-app":    path.join(PROJECTS_BASE, "victor-app"),
  "sarjup-panel":  path.join(PROJECTS_BASE, "sarjup-panel"),
  "sarjup-mobile": path.join(PROJECTS_BASE, "sarjup-mobile"),
};

// ─── Supabase & Anthropic ─────────────────────────────────────────────────────

const db: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY, maxRetries: 2, timeout: 55_000 });

// ─── Worker System Prompt ────────────────────────────────────────────────────

const SYSTEM = `Sen Bora'nın bilgisayarında çalışan Claude Code ajanısın. Gerçek dosyalara erişebilir, terminal komutları çalıştırabilir, kod yazabilir, deploy yapabilirsin.

Proje dizinleri:
- victor-app    → ${PROJECTS["victor-app"]}
- sarjup-panel  → ${PROJECTS["sarjup-panel"]}
- sarjup-mobile → ${PROJECTS["sarjup-mobile"]}

ÇALIŞMA STİLİ:
- Her adımı terminale yaz: ne yapıyorsun, neden
- Hataları yakala ve düzelt
- Başarılı sonuçları kısa özetle
- Dosya değişikliklerini belirt
- Deploy sonrası URL'i paylaş

KURAL: Kullanıcı onayı gereken yıkıcı işlemler (git reset --hard, branch sil, DB tablo düşür) için önce sor.`;

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "bash",
    description: "PowerShell komutu çalıştır. Proje dizinlerinde npm, git, vercel, tsc vb. komutlar için kullan.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: { type: "string", description: "PowerShell komutu" },
        cwd:     { type: "string", description: "Çalışma dizini (varsayılan: victor-app)" },
      },
      required: ["command"],
    },
  },
  {
    name: "read_file",
    description: "Dosya içeriğini oku.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Tam dosya yolu" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Dosyaya içerik yaz (tamamen değiştirir).",
    input_schema: {
      type: "object" as const,
      properties: {
        path:    { type: "string", description: "Tam dosya yolu" },
        content: { type: "string", description: "Yazılacak içerik" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_dir",
    description: "Dizin içeriğini listele.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Dizin yolu" },
      },
      required: ["path"],
    },
  },
  {
    name: "stream_update",
    description: "Panele ara sonuç gönder — uzun işlemlerde ilerlemeyi göstermek için kullan.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: { type: "string", description: "Terminale yazılacak mesaj" },
      },
      required: ["text"],
    },
  },
];

// ─── Tool Executor ─────────────────────────────────────────────────────────────

function runTool(
  name: string,
  input: Record<string, string>,
  taskId: string,
  outputRef: { value: string },
): string {
  if (name === "bash") {
    const cwd = input.cwd
      ? PROJECTS[input.cwd] ?? input.cwd
      : PROJECTS["victor-app"];
    const cmd = input.command;
    const line = `\n$ ${cmd}\n`;
    outputRef.value += line;
    process.stdout.write(line);
    try {
      const result = execSync(cmd, {
        cwd,
        shell: "powershell.exe",
        timeout: 60_000,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 4,
      });
      const out = result || "(çıktı yok)";
      outputRef.value += out + "\n";
      process.stdout.write(out + "\n");
      return out;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      const msg = `HATA: ${err.slice(0, 800)}`;
      outputRef.value += msg + "\n";
      process.stdout.write(msg + "\n");
      return msg;
    }
  }

  if (name === "read_file") {
    try {
      const content = fs.readFileSync(input.path, "utf8");
      process.stdout.write(`📖 Okundu: ${input.path} (${content.length} karakter)\n`);
      return content;
    } catch (e) {
      return `HATA: ${e instanceof Error ? e.message : "Dosya okunamadı"}`;
    }
  }

  if (name === "write_file") {
    try {
      fs.mkdirSync(path.dirname(input.path), { recursive: true });
      fs.writeFileSync(input.path, input.content, "utf8");
      const msg = `✅ Yazıldı: ${input.path}`;
      outputRef.value += msg + "\n";
      process.stdout.write(msg + "\n");
      return msg;
    } catch (e) {
      return `HATA: ${e instanceof Error ? e.message : "Yazılamadı"}`;
    }
  }

  if (name === "list_dir") {
    try {
      const entries = fs.readdirSync(input.path, { withFileTypes: true });
      return entries
        .map((e) => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`)
        .join("\n");
    } catch (e) {
      return `HATA: ${e instanceof Error ? e.message : "Dizin listelenemedi"}`;
    }
  }

  if (name === "stream_update") {
    const msg = input.text;
    outputRef.value += msg + "\n";
    process.stdout.write(msg + "\n");
    // Async DB update (fire-and-forget)
    void db.from("agent_tasks")
      .update({ result: outputRef.value })
      .eq("id", taskId);
    return "ok";
  }

  return `Bilinmeyen tool: ${name}`;
}

// ─── Task Runner ──────────────────────────────────────────────────────────────

async function processTask(taskId: string): Promise<void> {
  const { data: task, error } = await db
    .from("agent_tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error || !task) {
    console.error(`[worker] Görev bulunamadı: ${taskId}`);
    return;
  }
  if (task.status !== "pending") return;

  console.log(`\n🔵 Görev alındı: ${task.task_description?.slice(0, 80)}`);

  // Running'e al
  await db.from("agent_tasks").update({ status: "running" }).eq("id", taskId);
  await db.from("agent_activity").insert({
    agent_name: "claude-code",
    action: `Görev başladı: ${String(task.task_description).slice(0, 60)}`,
    task_id: taskId,
    details: { pid: process.pid },
  });

  const outputRef = { value: `> Görev: ${task.task_description}\n\n` };

  // Initial DB write
  await db.from("agent_tasks").update({ result: outputRef.value }).eq("id", taskId);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task.task_description as string },
  ];

  let continueLoop = true;
  let lastDbSync = Date.now();
  let loopCount = 0;
  const MAX_LOOPS = 12; // Sonsuz döngü koruması

  try {
    while (continueLoop) {
      loopCount++;
      if (loopCount > MAX_LOOPS) {
        outputRef.value += `\n⚠️ Maksimum döngü sayısına ulaşıldı (${MAX_LOOPS}), görev durduruluyor.\n`;
        process.stdout.write(`⚠️ Max loop (${MAX_LOOPS}) aşıldı, görev durduruluyor\n`);
        break;
      }

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM,
        tools: TOOLS,
        messages,
      });

      // Collect text blocks
      for (const block of response.content) {
        if (block.type === "text" && block.text) {
          outputRef.value += block.text + "\n";
          process.stdout.write(block.text + "\n");
        }
      }

      // Periodic DB sync (every 2s)
      if (Date.now() - lastDbSync > 2000) {
        lastDbSync = Date.now();
        await db.from("agent_tasks").update({ result: outputRef.value }).eq("id", taskId);
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );

        const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => ({
          type: "tool_result" as const,
          tool_use_id: tu.id,
          content: runTool(tu.name, tu.input as Record<string, string>, taskId, outputRef),
        }));

        // Sync after tool execution
        await db.from("agent_tasks").update({ result: outputRef.value }).eq("id", taskId);

        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
      } else {
        continueLoop = false;
      }
    }

    // Complete
    await db.from("agent_tasks").update({
      status: "completed",
      result: outputRef.value,
      completed_at: new Date().toISOString(),
    }).eq("id", taskId);

    await db.from("agent_activity").insert({
      agent_name: "claude-code",
      action: "Görev tamamlandı ✓",
      task_id: taskId,
      details: { output_len: outputRef.value.length },
    });

    console.log(`✅ Görev tamamlandı: ${taskId}`);

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error(`❌ Görev başarısız: ${errMsg}`);

    await db.from("agent_tasks").update({
      status: "failed",
      result: outputRef.value + `\n\nHATA: ${errMsg}`,
    }).eq("id", taskId);

    await db.from("agent_activity").insert({
      agent_name: "claude-code",
      action: `Görev başarısız: ${errMsg.slice(0, 60)}`,
      task_id: taskId,
      details: { error: errMsg },
    });
  }
}

// ─── Pending tasks on startup ─────────────────────────────────────────────────

async function processPendingTasks(): Promise<void> {
  // Worker kapanırken "running" kalan görevleri "failed" yap
  const { data: stale } = await db
    .from("agent_tasks")
    .select("id")
    .eq("agent_name", "claude-code")
    .eq("status", "running");

  if (stale?.length) {
    console.log(`🔄 ${stale.length} yarım kalmış görev 'failed' yapılıyor...`);
    for (const t of stale) {
      await db.from("agent_tasks")
        .update({ status: "failed", result: "Worker yeniden başlatıldı, görev yarım kaldı." })
        .eq("id", t.id);
    }
  }

  // Pending görevleri işle
  const { data } = await db
    .from("agent_tasks")
    .select("id")
    .eq("agent_name", "claude-code")
    .eq("status", "pending");

  if (data?.length) {
    console.log(`📋 ${data.length} bekleyen görev bulundu, işleniyor...`);
    for (const t of data) {
      await processTask(t.id as string);
    }
  }
}

// ─── Heartbeat ────────────────────────────────────────────────────────────────

async function heartbeat(): Promise<void> {
  await db.from("agent_activity").insert({
    agent_name: "claude-code",
    action: "heartbeat",
    details: { pid: process.pid, ts: new Date().toISOString() },
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
    console.error("❌ Eksik env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY");
    process.exit(1);
  }

  console.log("◆ Claude Code Worker başlatıldı");
  console.log(`  Supabase: ${SUPABASE_URL}`);
  console.log(`  PID: ${process.pid}\n`);

  // Heartbeat
  await heartbeat();
  setInterval(() => heartbeat().catch(() => {}), 30_000);

  // Startup: pending tasks
  await processPendingTasks();

  // Realtime subscription
  const channel = db.channel("claude-code-worker").on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "agent_tasks",
      filter: "agent_name=eq.claude-code",
    },
    async (payload) => {
      const task = payload.new as { id: string; status: string };
      if (task.status === "pending") {
        await processTask(task.id);
      }
    }
  );

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log("✅ Supabase realtime bağlandı — görev bekleniyor...\n");
    } else if (status === "CHANNEL_ERROR") {
      console.error("❌ Supabase bağlantı hatası");
    }
  });

  // Keep alive
  process.on("SIGINT", () => {
    console.log("\n👋 Worker kapatılıyor...");
    db.removeAllChannels();
    process.exit(0);
  });
}

main().catch(console.error);
