import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppText, sendWhatsAppTemplate } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    phone?: string;
    text?: string;
    template?: string;
    languageCode?: string;
    components?: unknown[];
  };

  const { phone, text, template, languageCode, components } = body;

  if (!phone) {
    return NextResponse.json({ error: "phone required" }, { status: 400 });
  }

  const result = template
    ? await sendWhatsAppTemplate(phone, template, languageCode, components)
    : await sendWhatsAppText(phone, text ?? "");

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
