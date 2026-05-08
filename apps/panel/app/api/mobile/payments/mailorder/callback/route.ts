/**
 * POST /api/mobile/payments/mailorder/callback
 *
 * iyzico 3DS callback endpoint'i.
 * 3D Secure gerektiren kart ödemelerinde iyzico bu endpoint'i çağırır.
 * iyzico dashboard'da bu URL tanımlı olmalı.
 *
 * Akış:
 *   1. İstek body'sinden conversationId al
 *   2. payment_receipts'te conversationId eşleşen kaydı bul
 *   3. Kayıt yoksa → yeni insert (güvenlik: sadece pending olanlar işlenir)
 *   4. Status 'approved' güncelle → NFC otomatik açılır
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isIyzicoAvailable } from '@/lib/iyzico/client'

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !serviceKey) throw new Error('Supabase env vars eksik')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isIyzicoAvailable()) {
    return NextResponse.json({ success: false, error: 'iyzico entegrasyonu bekleniyor.' })
  }

  // iyzico callback form-encoded veya JSON gönderebilir
  let callbackData: Record<string, string>
  const contentType = req.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      callbackData = Object.fromEntries(new URLSearchParams(text))
    } else {
      callbackData = await req.json() as Record<string, string>
    }
  } catch {
    return NextResponse.json({ success: false, error: 'İstek okunamadı.' })
  }

  const conversationId = callbackData['conversationId'] ?? callbackData['conversation_id']
  const paymentId = callbackData['paymentId'] ?? callbackData['payment_id']
  const status = callbackData['status']

  if (!conversationId) {
    return NextResponse.json({ success: false, error: 'conversationId eksik.' })
  }

  // iyzico başarısız callback → kayıt güncelleme gerek yok
  if (status && status !== 'success') {
    return NextResponse.json({ success: false, error: 'Ödeme başarısız.' })
  }

  const supabase = createServiceClient()

  // conversationId'ye göre kaydı bul
  const { data: existing } = await supabase
    .from('payment_receipts')
    .select('id, status, partner_id')
    .eq('iyzico_conversation_id', conversationId)
    .maybeSingle()

  if (existing && (existing as { status: string }).status === 'approved') {
    return NextResponse.json({ success: true, already_approved: true })
  }

  if (existing) {
    const { error } = await supabase
      .from('payment_receipts')
      .update({
        status: 'approved',
        payment_method: 'mail_order',
        ai_status: 'done',
        ai_confidence: 'high',
        reviewed_at: new Date().toISOString(),
        receipt_filename: paymentId ?? conversationId,
      })
      .eq('id', (existing as { id: string }).id)

    if (error) {
      return NextResponse.json({ success: false, error: `Kayıt güncellenemedi: ${error.message}` })
    }

    await supabase.from('activity_logs').insert({
      actor_id: (existing as { partner_id: string }).partner_id,
      actor_type: 'partner',
      action: 'mail_order_3ds_callback',
      resource_type: 'payment_receipt',
      resource_id: (existing as { id: string }).id,
      details: { iyzico_payment_id: paymentId, conversation_id: conversationId },
    })
  }

  // iyzico HTML yanıt bekleyebilir — düz 200 dön
  return NextResponse.json({ success: true })
}
