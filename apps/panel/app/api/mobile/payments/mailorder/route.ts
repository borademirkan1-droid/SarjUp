/**
 * POST /api/mobile/payments/mailorder
 *
 * Partner banka kartı ile ödeme yaparak NFC kilidini açar.
 * IYZICO_API_KEY ortam değişkeni set edilince otomatik aktif olur.
 *
 * Request body:
 *   partner_id  — UUID (zorunlu)
 *   device_id   — UUID (opsiyonel)
 *   amount      — number, TRY (zorunlu)
 *   card.holder_name   — string
 *   card.number        — string (boşluksuz)
 *   card.expire_month  — "MM"
 *   card.expire_year   — "YYYY"
 *   card.cvc           — string
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isIyzicoAvailable, iyzicoPaymentAuth } from '@/lib/iyzico/client'
import type { IyzicoPaymentAuthRequest } from '@/lib/iyzico/types'

interface CardInput {
  holder_name: string
  number: string
  expire_month: string
  expire_year: string
  cvc: string
}

interface RequestBody {
  partner_id: string
  device_id?: string
  amount: number
  card: CardInput
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !serviceKey) throw new Error('Supabase env vars eksik')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

function errorResponse(error: string, status = 200) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isIyzicoAvailable()) {
    return NextResponse.json({
      success: false,
      error: 'Mail order sistemi yakında aktif olacak. iyzico entegrasyonu bekleniyor.',
      available: false,
    })
  }

  // --- Body parse ---
  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return errorResponse('Geçersiz istek gövdesi.')
  }

  const { partner_id, device_id, amount, card } = body

  if (!partner_id?.trim()) return errorResponse('partner_id gerekli.')
  if (!amount || amount <= 0) return errorResponse('Geçerli tutar giriniz.')
  if (!card?.holder_name || !card.number || !card.expire_month || !card.expire_year || !card.cvc) {
    return errorResponse('Kart bilgileri eksik.')
  }

  const supabase = createServiceClient()

  // --- Partner doğrulama ---
  const { data: partner, error: partnerErr } = await supabase
    .from('partners')
    .select('id, full_name, email, phone, city, district, address, tc_no, status')
    .eq('id', partner_id.trim())
    .single()

  if (partnerErr || !partner) return errorResponse('Geçersiz partner.')
  if ((partner as { status: string }).status !== 'active') {
    return errorResponse('Partner hesabı aktif değil.')
  }

  const p = partner as {
    id: string
    full_name: string
    email: string
    phone: string
    city: string
    district: string
    address: string
    tc_no: string
    status: string
  }

  // --- Mevcut onaylı ödeme kontrolü ---
  const { data: existingApproved } = await supabase
    .from('payment_receipts')
    .select('id')
    .eq('partner_id', p.id)
    .eq('status', 'approved')
    .maybeSingle()

  if (existingApproved) {
    return NextResponse.json({ success: true, already_approved: true, message: 'NFC zaten açık.' })
  }

  // --- iyzico isteği oluştur ---
  const conversationId = `sarjup-${p.id.slice(0, 8)}-${Date.now()}`
  const amountStr = amount.toFixed(2)
  const fullName = p.full_name.trim()
  const nameParts = fullName.split(' ')
  const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : fullName
  const name = nameParts[0] ?? fullName

  const address: IyzicoPaymentAuthRequest['shippingAddress'] = {
    contactName: fullName,
    city: p.city,
    country: 'Turkey',
    address: p.address,
  }

  const iyzicoReq: IyzicoPaymentAuthRequest = {
    locale: 'tr',
    conversationId,
    price: amountStr,
    paidPrice: amountStr,
    currency: 'TRY',
    installment: 1,
    paymentChannel: 'MAIL_ORDER',
    paymentGroup: 'SUBSCRIPTION',
    paymentCard: {
      cardHolderName: card.holder_name,
      cardNumber: card.number.replace(/\s/g, ''),
      expireYear: card.expire_year,
      expireMonth: card.expire_month.padStart(2, '0'),
      cvc: card.cvc,
      registerCard: 0,
    },
    buyer: {
      id: p.id,
      name,
      surname,
      email: p.email,
      identityNumber: p.tc_no,
      phone: p.phone,
      registrationAddress: p.address,
      city: p.city,
      country: 'Turkey',
    },
    shippingAddress: address,
    billingAddress: address,
    basketItems: [
      {
        id: 'sarjup-nfc-abonelik',
        name: 'ŞarjUp NFC Abonelik',
        category1: 'Teknoloji',
        itemType: 'VIRTUAL',
        price: amountStr,
      },
    ],
  }

  // --- iyzico API çağrısı ---
  let iyzicoRes
  try {
    iyzicoRes = await iyzicoPaymentAuth(iyzicoReq)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'iyzico bağlantı hatası'
    return errorResponse(msg)
  }

  if (iyzicoRes.status !== 'success') {
    return errorResponse(
      iyzicoRes.errorMessage ?? `Ödeme başarısız (${iyzicoRes.errorCode ?? 'bilinmeyen hata'})`
    )
  }

  // --- Ödeme kayıt oluştur ---
  const { error: insertErr } = await supabase
    .from('payment_receipts')
    .insert({
      partner_id: p.id,
      device_id: device_id ?? null,
      amount,
      receipt_url: '',
      receipt_filename: iyzicoRes.paymentId ?? conversationId,
      status: 'approved',
      payment_method: 'mail_order',
      ai_status: 'done',
      ai_confidence: 'high',
      reviewed_at: new Date().toISOString(),
      iyzico_conversation_id: conversationId,
    })

  if (insertErr) {
    return errorResponse(`Ödeme kaydı oluşturulamadı: ${insertErr.message}`)
  }

  await supabase.from('activity_logs').insert({
    actor_id: p.id,
    actor_type: 'partner',
    action: 'mail_order_payment',
    resource_type: 'payment_receipt',
    resource_id: null,
    details: {
      amount,
      iyzico_payment_id: iyzicoRes.paymentId,
      conversation_id: conversationId,
    },
  })

  return NextResponse.json({
    success: true,
    nfc_unlocked: true,
    iyzico_payment_id: iyzicoRes.paymentId,
    auth_code: iyzicoRes.authCode,
  })
}
