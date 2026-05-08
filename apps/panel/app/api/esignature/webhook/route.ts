import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SignatureSessionRow } from '@/lib/supabase/types'

interface TurktrustWebhookPayload {
  sessionId?: string
  status?: string
  signatureValue?: string
  certificateSerial?: string
  completedAt?: string
}

function verifyTurktrustSignature(
  payload: string,
  signature: string,
  apiKey: string
): boolean {
  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(payload)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get('x-turktrust-signature') ?? ''
  const apiKey = process.env.TURKTRUST_API_KEY ?? ''

  if (apiKey && !verifyTurktrustSignature(raw, signature, apiKey)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: TurktrustWebhookPayload
  try {
    body = JSON.parse(raw) as TurktrustWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 })
  }

  const { sessionId, status, signatureValue, certificateSerial, completedAt } =
    body

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId zorunludur' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  const { data: row, error: fetchError } = await supabase
    .from('signature_sessions')
    .select('id, status')
    .eq('external_session_id', sessionId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: 'Oturum bulunamadı' },
      { status: 404 }
    )
  }

  const VALID_STATUSES: SignatureSessionRow['status'][] = [
    'pending',
    'otp_sent',
    'completed',
    'rejected',
    'expired',
    'cancelled',
  ]

  const updatePayload: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }

  if (status && VALID_STATUSES.includes(status as SignatureSessionRow['status'])) {
    updatePayload.status = status
  }
  if (signatureValue) {
    updatePayload.signature_value = signatureValue
  }
  if (certificateSerial) {
    updatePayload.certificate_serial = certificateSerial
  }
  if (completedAt) {
    updatePayload.completed_at = completedAt
  } else if (status === 'completed') {
    updatePayload.completed_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('signature_sessions')
    .update(updatePayload)
    .eq('external_session_id', sessionId)

  if (updateError) {
    return NextResponse.json(
      { error: 'Güncelleme başarısız: ' + updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
