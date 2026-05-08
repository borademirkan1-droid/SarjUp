import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LeadPipelineStatus } from "@/lib/supabase/types";

const VALID_STATUSES: LeadPipelineStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { leadId, status, note } = body as {
    leadId?: string;
    status?: string;
    note?: string;
  };

  if (!leadId || !status) {
    return NextResponse.json(
      { error: "leadId + status required" },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status as LeadPipelineStatus)) {
    return NextResponse.json(
      { error: `Geçersiz status. Geçerli değerler: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("leads")
    .update({
      pipeline_status: status,
      pipeline_note: note ?? null,
      ...(status === "contacted"
        ? { last_contacted_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", leadId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
