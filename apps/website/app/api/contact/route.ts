import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // Initialize inside handler so env vars are evaluated at runtime, not build time
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, businessType, region, message } = body;

    if (!firstName || (!email && !phone)) {
      return NextResponse.json({ error: "Ad ve iletişim bilgisi zorunludur." }, { status: 400 });
    }

    // 1. Supabase leads tablosuna kaydet
    const { error: dbError } = await supabase.from("leads").insert({
      first_name: firstName,
      last_name: lastName || null,
      email: email || null,
      phone: phone || null,
      business_type: businessType || null,
      region: region || null,
      message: message || null,
      status: "new",
      source: "website_form",
    });

    if (dbError) {
      console.error("Supabase leads insert error:", dbError);
      return NextResponse.json({ error: "Kayıt hatası." }, { status: 500 });
    }

    // 2. info@sarjup.com.tr'ye bildirim maili
    const apiKey = process.env.RESEND_API_KEY;
    console.log("[contact] RESEND_API_KEY set:", !!apiKey);

    const notifResult = await resend.emails.send({
      from: "Şarjup Form <noreply@sarjup.com.tr>",
      to: ["info@sarjup.com.tr"],
      subject: `🔔 Yeni Form Başvurusu: ${firstName} ${lastName || ""} — ${region || "Bölge belirtilmedi"}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:32px;border-radius:16px;">
          <div style="margin-bottom:24px;">
            <span style="background:#0066FF;color:#fff;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;">YENİ BAŞVURU</span>
          </div>
          <h2 style="margin:0 0 24px;font-size:24px;font-weight:700;">İletişim Formu Dolduruldu</h2>

          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;width:140px;">Ad Soyad</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:600;">${firstName} ${lastName || ""}</td></tr>
            ${email ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);">${email}</td></tr>` : ""}
            ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;">Telefon</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);">${phone}</td></tr>` : ""}
            ${businessType ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;">İşletme Türü</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);">${businessType}</td></tr>` : ""}
            ${region ? `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;">Bölge</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);">${region}</td></tr>` : ""}
            ${message ? `<tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;vertical-align:top;">Mesaj</td>
                <td style="padding:10px 0;">${message}</td></tr>` : ""}
          </table>

          <div style="margin-top:32px;padding:16px;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.3);border-radius:12px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">
              Admin panelden görüntüle:
              <a href="https://admin.sarjup.com.tr" style="color:#0066FF;">admin.sarjup.com.tr</a>
            </p>
          </div>
        </div>
      `,
    });
    console.log("[contact] notif result:", JSON.stringify(notifResult));

    // 3. Kullanıcıya otomatik yanıt (sadece email varsa)
    if (email) {
      const replyResult = await resend.emails.send({
        from: "Şarjup <info@sarjup.com.tr>",
        to: [email],
        subject: "Mesajınızı aldık — Şarjup",
        html: `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#f8fafc;padding:40px;border-radius:16px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0066FF,#10B981);padding:10px 20px;border-radius:12px;font-weight:700;font-size:20px;">
                ⚡ Şarjup
              </div>
            </div>
            <h2 style="font-size:22px;font-weight:700;margin:0 0 12px;">Merhaba ${firstName},</h2>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 20px;">
              Mesajınızı aldık. En geç <strong style="color:#fff;">24 saat içinde</strong> dönüş yapacağız.
            </p>
            <p style="color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 32px;">
              Daha hızlı yanıt için WhatsApp'tan ulaşabilirsiniz:
            </p>
            <a href="https://wa.me/905403664141" style="display:inline-block;background:#10B981;color:#fff;padding:14px 28px;border-radius:99px;font-weight:600;text-decoration:none;font-size:15px;">
              💬 WhatsApp: 0540 366 41 41
            </a>
            <hr style="margin:40px 0;border:none;border-top:1px solid rgba(255,255,255,0.1);" />
            <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0;">
              Şarjup — Modern işletmeler için akıllı şarj çözümü<br/>
              Kocaeli / İzmit · sarjup.com.tr
            </p>
          </div>
        `,
      });
      console.log("[contact] reply result:", JSON.stringify(replyResult));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
