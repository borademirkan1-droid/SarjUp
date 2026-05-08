import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateSignature } from '@/lib/esignature'

interface InitiateBody {
  documentType?: string
  documentRefId?: string
  documentContent?: string
  signerPhone?: string
  signerName?: string
  documentTitle?: string
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: InitiateBody
  try {
    body = (await req.json()) as InitiateBody
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 })
  }

  const {
    documentType,
    documentRefId,
    documentContent,
    signerPhone,
    signerName,
    documentTitle,
  } = body

  if (
    !documentType ||
    !documentRefId ||
    !documentContent ||
    !signerPhone ||
    !signerName ||
    !documentTitle
  ) {
    return NextResponse.json(
      {
        error:
          'documentType, documentRefId, documentContent, signerPhone, signerName, documentTitle zorunludur',
      },
      { status: 400 }
    )
  }

  const documentHash = crypto
    .createHash('sha256')
    .update(documentContent, 'utf8')
    .digest('hex')

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { data: sessionRow, error: insertError } = await supabase
    .from('signature_sessions')
    .insert({
      document_type: documentType,
      document_ref_id: documentRefId,
      document_hash: documentHash,
      document_title: documentTitle,
      signer_phone: signerPhone,
      signer_name: signerName,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (insertError || !sessionRow) {
    return NextResponse.json(
      { error: 'Kayıt oluşturulamadı: ' + (insertError?.message ?? 'bilinmeyen hata') },
      { status: 500 }
    )
  }

  const internalId = sessionRow.id as string

  try {
    const signatureSession = await initiateSignature({
      documentId: internalId,
      documentHash,
      documentTitle,
      signerPhone,
      signerName,
      expiresInMinutes: 10,
    })

    await supabase
      .from('signature_sessions')
      .update({
        external_session_id: signatureSession.sessionId,
        status: signatureSession.otpSent ? 'otp_sent' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', internalId)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: internalId,
        externalSessionId: signatureSession.sessionId,
        status: signatureSession.otpSent ? 'otp_sent' : 'pending',
        otpSent: signatureSession.otpSent,
      },
    })
  } catch (err: unknown) {
    const isServiceInactive =
      err instanceof Error && err.message === 'e-İmza servisi henüz aktif değil'

    if (isServiceInactive) {
      return NextResponse.json({
        success: true,
        data: {
          sessionId: internalId,
          status: 'pending',
          message: 'e-İmza servisi henüz aktif değil, kayıt oluşturuldu',
        },
      })
    }

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'İmza başlatılamadı',
      },
      { status: 500 }
    )
  }
}
