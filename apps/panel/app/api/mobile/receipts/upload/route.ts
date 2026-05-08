/**
 * POST /api/mobile/receipts/upload
 *
 * Mobil app'ten banka dekontu yükleme endpoint'i.
 * multipart/form-data kabul eder.
 *
 * Form fields:
 *   file        — image (jpeg/png/webp/pdf), max 10MB
 *   partner_id  — UUID (zorunlu)
 *   device_id   — UUID (opsiyonel)
 *   amount      — sayısal string (zorunlu)
 *
 * Auth: şu an yok — mobil app Bearer token hazır olunca eklenecek.
 * Service client kullanır (SUPABASE_SECRET_KEY).
 *
 * Başarılı INSERT sonrası Supabase Webhook otomatik
 * /api/receipts/analyze endpoint'ini tetikler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

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

function errorResponse(error: string) {
  return NextResponse.json({ success: false, error }, { status: 200 })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // multipart/form-data parse
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return errorResponse('Form verisi okunamadı.')
  }

  // --- Alan doğrulama ---

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return errorResponse('Dosya gerekli.')
  }

  const partnerIdRaw = formData.get('partner_id')
  if (!partnerIdRaw || typeof partnerIdRaw !== 'string' || partnerIdRaw.trim() === '') {
    return errorResponse('partner_id gerekli.')
  }
  const partnerId = partnerIdRaw.trim()

  const deviceIdRaw = formData.get('device_id')
  const deviceId: string | null =
    deviceIdRaw && typeof deviceIdRaw === 'string' && deviceIdRaw.trim() !== ''
      ? deviceIdRaw.trim()
      : null

  const amountRaw = formData.get('amount')
  if (!amountRaw || typeof amountRaw !== 'string') {
    return errorResponse('Geçerli tutar giriniz.')
  }
  const amount = parseFloat(amountRaw.replace(',', '.'))
  if (isNaN(amount) || amount <= 0) {
    return errorResponse('Geçerli tutar giriniz.')
  }

  // --- Dosya doğrulama ---

  const mimeType = file.type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return errorResponse('Sadece JPEG, PNG, WEBP veya PDF kabul edilir.')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse('Dosya boyutu 10MB\'ı aşamaz.')
  }

  // --- Supabase client ---

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return errorResponse(`Servis başlatılamadı: ${msg}`)
  }

  // --- Partner doğrulama ---

  const { data: partnerData, error: partnerError } = await supabase
    .from('partners')
    .select('id, status')
    .eq('id', partnerId)
    .single()

  if (partnerError || !partnerData) {
    return errorResponse('Geçersiz partner.')
  }

  const partner = partnerData as { id: string; status: string }
  if (partner.status !== 'active') {
    return errorResponse('Geçersiz partner.')
  }

  // --- Storage yükleme ---

  const originalFilename = file.name ?? `upload.${mimeType.split('/')[1] ?? 'bin'}`
  const storagePath = `${partnerId}/${Date.now()}-${originalFilename}`

  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (uploadError) {
    return errorResponse(`Dosya yüklenemedi: ${uploadError.message}`)
  }

  // Public URL oluştur (bucket public ise) — yoksa path'i saklarız
  const { data: publicUrlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(storagePath)

  const receiptUrl = publicUrlData?.publicUrl ?? storagePath

  // --- payment_receipts INSERT ---

  const { data: insertData, error: insertError } = await supabase
    .from('payment_receipts')
    .insert({
      partner_id: partnerId,
      device_id: deviceId,
      amount,
      receipt_url: receiptUrl,
      receipt_filename: originalFilename,
      status: 'pending',
      payment_method: 'bank_transfer',
      ai_status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !insertData) {
    // Yüklenen dosyayı temizle
    await supabase.storage.from('receipts').remove([storagePath])
    return errorResponse(`Kayıt oluşturulamadı: ${insertError?.message ?? 'Bilinmeyen hata'}`)
  }

  const receiptId = (insertData as { id: string }).id

  return NextResponse.json({ success: true, receipt_id: receiptId }, { status: 200 })
}
