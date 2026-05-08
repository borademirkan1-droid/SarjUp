import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tokens, title, body, data } = await req.json();
  if (!tokens?.length || !title || !body)
    return NextResponse.json({ error: "tokens, title, body required" }, { status: 400 });

  const result = await sendPushNotification(tokens, { title, body, data });
  return NextResponse.json(result);
}
