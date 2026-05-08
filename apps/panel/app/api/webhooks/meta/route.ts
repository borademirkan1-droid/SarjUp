import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/webhook";

// Meta webhook verification challenge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  const appSecret = process.env.META_APP_SECRET ?? "";

  if (appSecret && !verifyMetaSignature(raw, signature, appSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Lead ads entry işle
  const entries = (body.entry as unknown[]) ?? [];
  console.log("[Meta Webhook] entries:", entries.length);

  return NextResponse.json({ received: true });
}
