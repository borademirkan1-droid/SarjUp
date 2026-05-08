import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();

  if (
    !body ||
    typeof body !== "object" ||
    !("fullName" in body) ||
    !("email" in body) ||
    !("password" in body) ||
    !("businessName" in body) ||
    !("city" in body)
  ) {
    return NextResponse.json(
      { error: "Tüm alanlar zorunlu" },
      { status: 400 }
    );
  }

  const { fullName, email, password, phone, businessName, city } = body as {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    businessName: string;
    city: string;
  };

  if (!fullName || !email || !password || !businessName || !city) {
    return NextResponse.json(
      { error: "Tüm alanlar zorunlu" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Şifre en az 8 karakter olmalı" },
      { status: 400 }
    );
  }

  const supabase = createClient();

  // Supabase Auth kullanıcısı oluştur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone ?? null },
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json(
      { error: "Kullanıcı oluşturulamadı" },
      { status: 500 }
    );
  }

  // partners tablosuna ekle — PartnerRow şemasına uygun
  const { error: partnerError } = await supabase.from("partners").insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    phone: phone ?? null,
    city,
    status: "pending" as const,
    // Zorunlu alanlar için boş başlangıç değerleri
    tc_no: "",
    district: "",
    address: "",
    commission_rate: 0,
  });

  if (partnerError) {
    // Auth kullanıcısı oluşturuldu ama partner satırı eklenemedi —
    // Supabase e-posta doğrulama akışı devam edebilir, hata logla
    return NextResponse.json(
      { error: partnerError.message },
      { status: 500 }
    );
  }

  // İlk işletmeyi ekle — hata bloklayıcı değil, başarı döndür
  await supabase.from("businesses").insert({
    partner_id: authData.user.id,
    name: businessName,
    city,
    status: "inactive" as const,
    // BusinessRow zorunlu alanları için boş başlangıç değerleri
    business_type: "other" as const,
    phone: "",
    address: "",
    district: "",
    contact_person: fullName,
    contact_phone: phone ?? "",
    device_count: 0,
    monthly_fee: 0,
    contract_start_date: new Date().toISOString().split("T")[0],
  });

  return NextResponse.json({ success: true });
}
