/**
 * GET /api/mobile/nfc-status
 *
 * NFC kilidi durum sorgulama endpoint'i.
 * Mobil app, ödeme sonrası NFC'nin açık olup olmadığını buradan öğrenir.
 *
 * Query params:
 *   partner_id — UUID (zorunlu)
 *   device_id  — UUID (opsiyonel)
 *
 * Auth: şu an yok — mobil app Bearer token hazır olunca eklenecek.
 * Service client kullanır (SUPABASE_SECRET_KEY).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// --- Dönüş tipi ---
interface NfcStatusResponse {
  nfc_unlocked: boolean
  reason?: 'pending_review' | 'no_payment' | 'rejected'
  receipt_id?: string
  approved_at?: string
  amount?: number
  payment_method?: string
  pending_since?: string
  ai_status?: string
  latest_rejection_reason?: string
}

// --- Veritabanı satır tipi ---
interface ReceiptRow {
  id: string
  status: string
  ai_status: string | null
  payment_method: string
  amount: number
  created_at: string
  reviewed_at: string | null
  rejection_reason: string | null
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase env vars eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SECRET_KEY')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)

  const partnerId = searchParams.get('partner_id')
  if (!partnerId || partnerId.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'partner_id gerekli.' },
      { status: 200 }
    )
  }

  const deviceId = searchParams.get('device_id') ?? null

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: `Servis başlatılamadı: ${msg}` }, { status: 200 })
  }

  // --- Sorgu ---
  let query = supabase
    .from('payment_receipts')
    .select('id, status, ai_status, payment_method, amount, created_at, reviewed_at, rejection_reason')
    .eq('partner_id', partnerId.trim())
    .order('created_at', { ascending: false })
    .limit(10)

  if (deviceId && deviceId.trim() !== '') {
    query = query.or(`device_id.eq.${deviceId.trim()},device_id.is.null`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { success: false, error: `Sorgu hatası: ${error.message}` },
      { status: 200 }
    )
  }

  const rows = (data ?? []) as ReceiptRow[]

  // --- Durum hesaplama ---

  // 1. Onaylı kayıt var mı?
  const approvedRow = rows.find((r) => r.status === 'approved')
  if (approvedRow) {
    const response: NfcStatusResponse = {
      nfc_unlocked: true,
      receipt_id: approvedRow.id,
      approved_at: approvedRow.reviewed_at ?? approvedRow.created_at,
      amount: approvedRow.amount,
      payment_method: approvedRow.payment_method,
    }
    return NextResponse.json({ success: true, ...response }, { status: 200 })
  }

  // 2. Bekleyen kayıt var mı?
  const pendingRow = rows.find((r) => r.status === 'pending')
  if (pendingRow) {
    const response: NfcStatusResponse = {
      nfc_unlocked: false,
      reason: 'pending_review',
      pending_since: pendingRow.created_at,
      ai_status: pendingRow.ai_status ?? undefined,
    }
    return NextResponse.json({ success: true, ...response }, { status: 200 })
  }

  // 3. Reddedilen kayıt var mı?
  const rejectedRow = rows.find((r) => r.status === 'rejected')
  if (rejectedRow) {
    const response: NfcStatusResponse = {
      nfc_unlocked: false,
      reason: 'rejected',
      latest_rejection_reason: rejectedRow.rejection_reason ?? undefined,
    }
    return NextResponse.json({ success: true, ...response }, { status: 200 })
  }

  // 4. Hiç kayıt yok
  const response: NfcStatusResponse = {
    nfc_unlocked: false,
    reason: 'no_payment',
  }
  return NextResponse.json({ success: true, ...response }, { status: 200 })
}
