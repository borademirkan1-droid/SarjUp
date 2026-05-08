import { NextRequest, NextResponse } from "next/server";
import { verifyIyzicoSignature } from "@/lib/webhook";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-iyz-signature") ?? "";
  const secret = process.env.IYZICO_WEBHOOK_SECRET ?? "";

  if (secret && !verifyIyzicoSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createClient();
  await supabase.from("activity_logs").insert({
    action: "iyzico_webhook",
    details: body,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ received: true });
}
