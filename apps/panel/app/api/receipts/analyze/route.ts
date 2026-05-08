/**
 * POST /api/receipts/analyze
 *
 * Supabase Database Webhook Kurulum Talimatı:
 * --------------------------------------------------
 * 1. Supabase Dashboard > Database > Webhooks > "Create a new hook"
 * 2. Name: receipt_ai_analyze
 * 3. Table: payment_receipts
 * 4. Events: INSERT
 * 5. Type: HTTP Request
 * 6. URL: https://admin.sarjup.com.tr/api/receipts/analyze
 * 7. HTTP Method: POST
 * 8. Headers:
 *      Content-Type: application/json
 *      x-webhook-secret: <WEBHOOK_SECRET — .env.local'a ekleyin>
 * 9. Payload (custom): { "receipt_id": "{{ NEW_RECORD.id }}" }
 *    (Supabase webhook payload template syntax kullanılır)
 *
 * .env.local'a eklenecekler:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   RECEIPT_WEBHOOK_SECRET=<rastgele güçlü string>
 * --------------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Tolerans: ±1 TL
const AMOUNT_TOLERANCE = 1

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase env vars eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SECRET_KEY')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

type DbClient = ReturnType<typeof createServiceClient>

async function setAiFailed(
  client: DbClient,
  receiptId: string,
  reason: string
): Promise<void> {
  await (client as DbClient)
    .from('payment_receipts')
    .update({
      ai_status: 'failed',
      ai_analyzed_at: new Date().toISOString(),
      ai_analysis_notes: reason,
    } as Parameters<ReturnType<DbClient['from']>['update']>[0])
    .eq('id', receiptId)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Webhook secret doğrulama (opsiyonel ama önerilir)
  const webhookSecret = process.env.RECEIPT_WEBHOOK_SECRET
  if (webhookSecret) {
    const incomingSecret = req.headers.get('x-webhook-secret')
    if (incomingSecret !== webhookSecret) {
      // 200 döndür — webhook retry döngüsüne girmesin
      return NextResponse.json({ success: false, error: 'Yetkisiz istek.' }, { status: 200 })
    }
  }

  // Supabase Database Webhook payload formatı:
  // { type: "INSERT", table: "payment_receipts", record: { id: "...", ... }, schema: "public", old_record: null }
  // Alternatif: direkt { receipt_id: "..." }
  let receipt_id: string | undefined
  try {
    const body = await req.json() as {
      receipt_id?: string
      type?: string
      record?: { id?: string }
    }
    receipt_id = body.receipt_id ?? body.record?.id
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON body.' }, { status: 200 })
  }

  if (!receipt_id || typeof receipt_id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'receipt_id eksik veya geçersiz.' },
      { status: 200 }
    )
  }

  const supabase = createServiceClient()

  // 1. Dekontu çek
  const { data: receiptData, error: fetchError } = await supabase
    .from('payment_receipts')
    .select('id, amount, receipt_url, status, ai_status')
    .eq('id', receipt_id)
    .single()

  if (fetchError || !receiptData) {
    return NextResponse.json({ success: false, error: 'Dekont bulunamadı.' }, { status: 200 })
  }

  const receipt = receiptData as {
    id: string
    amount: number
    receipt_url: string
    status: string
    ai_status: string | null
  }

  // Zaten analiz edilmişse tekrar çalıştırma
  if (receipt.ai_status === 'done' || receipt.ai_status === 'failed') {
    return NextResponse.json({ success: true, message: 'Zaten analiz edildi.' }, { status: 200 })
  }

  // Pending olmayan dekontları analiz etme
  if (receipt.status !== 'pending') {
    return NextResponse.json(
      { success: true, message: 'Beklemede olmayan dekont analiz edilmez.' },
      { status: 200 }
    )
  }

  // 2. Signed URL al
  const storagePath = receipt.receipt_url.replace(
    /^.*\/storage\/v1\/object\/(private|public)\/receipts\//,
    ''
  )
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('receipts')
    .createSignedUrl(storagePath, 60)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    await setAiFailed(supabase, receipt_id, 'Storage signed URL alınamadı.')
    return NextResponse.json({ success: false, error: 'Signed URL alınamadı.' }, { status: 200 })
  }

  // 3. Görseli base64 encode et (Claude Vision için)
  let imageBase64: string
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

  try {
    const imageRes = await fetch(signedUrlData.signedUrl)
    if (!imageRes.ok) {
      throw new Error(`HTTP ${imageRes.status}`)
    }
    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg'

    // PDF desteği yok — sadece görsel
    if (contentType.includes('pdf')) {
      await setAiFailed(supabase, receipt_id, 'PDF dekontlar görsel analiz ile işlenemiyor.')
      return NextResponse.json({ success: false, error: 'PDF desteklenmiyor.' }, { status: 200 })
    }

    const buffer = await imageRes.arrayBuffer()
    imageBase64 = Buffer.from(buffer).toString('base64')

    if (contentType.includes('png')) mediaType = 'image/png'
    else if (contentType.includes('gif')) mediaType = 'image/gif'
    else if (contentType.includes('webp')) mediaType = 'image/webp'
    else mediaType = 'image/jpeg'
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await setAiFailed(supabase, receipt_id, `Görsel indirilemedi: ${errMsg}`)
    return NextResponse.json({ success: false, error: 'Görsel indirilemedi.' }, { status: 200 })
  }

  // 4. Claude Vision ile analiz
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    await setAiFailed(supabase, receipt_id, 'ANTHROPIC_API_KEY tanımlı değil.')
    return NextResponse.json({ success: false, error: 'AI yapılandırması eksik.' }, { status: 200 })
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey })

  let aiResponseText: string
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Bu bir banka havale/EFT dekontudur. Dekonttaki transfer/gönderilen tutarı Türk Lirası cinsinden çıkar. Sadece sayısal değeri yaz (örn: 1500.00). Tutarı kesinlikle bulamazsan BULUNAMADI yaz.',
            },
          ],
        },
      ],
    })

    const firstBlock = message.content[0]
    if (firstBlock.type !== 'text') {
      throw new Error('Claude beklenmedik yanıt tipi döndürdü.')
    }
    aiResponseText = firstBlock.text.trim()
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    await setAiFailed(supabase, receipt_id, `Claude API hatası: ${errMsg}`)
    return NextResponse.json({ success: false, error: 'AI analizi başarısız.' }, { status: 200 })
  }

  // 5. Yanıtı parse et
  if (aiResponseText.toUpperCase().includes('BULUNAMADI')) {
    await setAiFailed(supabase, receipt_id, 'AI dekont tutarını okuyamadı.')
    return NextResponse.json({ success: true, result: 'failed' }, { status: 200 })
  }

  // Sayıyı temizle: nokta/virgül normalleştir, TL/₺ simgelerini kaldır
  const cleaned = aiResponseText
    .replace(/[₺TL\s]/gi, '')
    .replace(/\./g, '') // binlik ayracı noktaları kaldır
    .replace(',', '.') // ondalık virgülü noktaya çevir

  const aiAmount = parseFloat(cleaned)
  if (isNaN(aiAmount) || aiAmount <= 0) {
    await setAiFailed(
      supabase,
      receipt_id,
      `Parse edilemeyen AI yanıtı: "${aiResponseText}"`
    )
    return NextResponse.json({ success: true, result: 'failed' }, { status: 200 })
  }

  const declaredAmount: number = receipt.amount
  const diff = Math.abs(aiAmount - declaredAmount)
  const isMatch = diff <= AMOUNT_TOLERANCE
  const now = new Date().toISOString()

  if (isMatch) {
    // 6a. Tutarlar eşleşiyor — otomatik onayla
    const { error: updateError } = await supabase
      .from('payment_receipts')
      .update({
        status: 'approved',
        reviewed_by: null,
        reviewed_at: now,
        ai_extracted_amount: aiAmount,
        ai_confidence: 'high',
        ai_analysis_notes: `AI okunan tutar: ${aiAmount.toFixed(2)} TL, Beyan edilen: ${declaredAmount.toFixed(2)} TL, Fark: ${diff.toFixed(2)} TL`,
        ai_analyzed_at: now,
        ai_status: 'done',
      })
      .eq('id', receipt_id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'DB güncellenemedi: ' + updateError.message },
        { status: 200 }
      )
    }

    // Activity log
    await supabase.from('activity_logs').insert({
      actor_id: receipt.id,
      actor_type: 'admin',
      action: 'ai_auto_approve',
      resource_type: 'payment_receipts',
      resource_id: receipt_id,
      details: {
        ai_extracted_amount: aiAmount,
        declared_amount: declaredAmount,
        diff,
        model: 'claude-haiku-4-5-20251001',
      },
    })

    return NextResponse.json(
      { success: true, result: 'auto_approved', ai_amount: aiAmount },
      { status: 200 }
    )
  } else {
    // 6b. Tutarlar uyuşmuyor — admin incelemesi için beklet
    const notes = `AI okunan tutar: ${aiAmount.toFixed(2)} TL, Beyan edilen: ${declaredAmount.toFixed(2)} TL, Fark: ${diff.toFixed(2)} TL — Manuel inceleme gerekli.`

    const { error: updateError } = await supabase
      .from('payment_receipts')
      .update({
        ai_extracted_amount: aiAmount,
        ai_confidence: 'low',
        ai_analysis_notes: notes,
        ai_analyzed_at: now,
        ai_status: 'done',
        // status 'pending' olarak kalır
      })
      .eq('id', receipt_id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'DB güncellenemedi: ' + updateError.message },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, result: 'mismatch', ai_amount: aiAmount, declared: declaredAmount, diff },
      { status: 200 }
    )
  }
}
