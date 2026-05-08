import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSignatureStatus, cancelSignature } from '@/lib/esignature'
import type { SignatureSessionRow } from '@/lib/supabase/types'

interface RouteContext {
  params: { sessionId: string }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = params

  const { data: row, error: fetchError } = await supabase
    .from('signature_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 404 })
  }

  const session = row as SignatureSessionRow

  if (!session.external_session_id) {
    return NextResponse.json({ success: true, data: session })
  }

  try {
    const remoteStatus = await getSignatureStatus(session.external_session_id)

    const statusMap: Record<string, string> = {
      pending: 'pending',
      completed: 'completed',
      rejected: 'rejected',
      expired: 'expired',
    }
    const mappedStatus = statusMap[remoteStatus.status] ?? 'pending'

    const updatePayload: Partial<SignatureSessionRow> & {
      updated_at: string
    } = {
      status: mappedStatus as SignatureSessionRow['status'],
      updated_at: new Date().toISOString(),
    }

    if (remoteStatus.completedAt) {
      updatePayload.completed_at = remoteStatus.completedAt
    }
    if (remoteStatus.signatureValue) {
      updatePayload.signature_value = remoteStatus.signatureValue
    }
    if (remoteStatus.certificateSerial) {
      updatePayload.certificate_serial = remoteStatus.certificateSerial
    }

    await supabase
      .from('signature_sessions')
      .update(updatePayload)
      .eq('id', sessionId)

    return NextResponse.json({
      success: true,
      data: { ...session, ...updatePayload },
    })
  } catch (err: unknown) {
    // Return cached DB state if Türktrust is unavailable
    return NextResponse.json({
      success: true,
      data: session,
      warning:
        err instanceof Error ? err.message : 'Durum güncellenemedi',
    })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = params

  const { data: row, error: fetchError } = await supabase
    .from('signature_sessions')
    .select('external_session_id, status')
    .eq('id', sessionId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 404 })
  }

  const session = row as Pick<SignatureSessionRow, 'external_session_id' | 'status'>

  if (session.external_session_id) {
    try {
      await cancelSignature(session.external_session_id)
    } catch (err: unknown) {
      // Log but do not block — still mark cancelled in DB
      const message = err instanceof Error ? err.message : 'İptal isteği başarısız'
      await supabase.from('signature_sessions').update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('id', sessionId)

      return NextResponse.json(
        { error: `Türktrust iptal hatası: ${message}` },
        { status: 502 }
      )
    }
  }

  const { error: updateError } = await supabase
    .from('signature_sessions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (updateError) {
    return NextResponse.json(
      { error: 'Durum güncellenemedi: ' + updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
