import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEFaturaStatus, cancelEFatura } from '@/lib/efatura'

interface RouteContext {
  params: { id: string }
}

interface PatchBody {
  action?: string
  reason?: string
}

// GET /api/efatura/[id] — fetch status from Nilvera and sync to DB
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  const { data: invoiceData, error: fetchError } = await supabase
    .from('invoices')
    .select('id, external_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !invoiceData) {
    return NextResponse.json({ success: false, error: 'Fatura bulunamadı.' }, { status: 404 })
  }

  const invoice = invoiceData as { id: string; external_id: string | null; status: string }

  if (!invoice.external_id) {
    return NextResponse.json(
      { success: false, error: 'Bu fatura için harici ID mevcut değil.' },
      { status: 422 }
    )
  }

  let remoteStatus
  try {
    remoteStatus = await getEFaturaStatus(invoice.external_id)
  } catch (err) {
    if (err instanceof Error && err.message === 'NILVERA_API_KEY not configured') {
      return NextResponse.json(
        { success: false, error: 'e-Fatura servisi henüz aktif değil' },
        { status: 503 }
      )
    }
    const msg = err instanceof Error ? err.message : 'Nilvera durumu alınamadı.'
    return NextResponse.json({ success: false, error: msg }, { status: 502 })
  }

  // Map Nilvera status to local enum
  const statusMap: Record<string, string> = {
    draft: 'draft',
    sent: 'sent',
    accepted: 'accepted',
    rejected: 'rejected',
    cancelled: 'cancelled',
  }
  const localStatus = statusMap[remoteStatus.status.toLowerCase()] ?? invoice.status

  const updatePayload: Record<string, unknown> = {
    status: localStatus,
    updated_at: new Date().toISOString(),
  }
  if (remoteStatus.pdfUrl) {
    updatePayload.pdf_url = remoteStatus.pdfUrl
  }

  await supabase.from('invoices').update(updatePayload).eq('id', id)

  return NextResponse.json({
    success: true,
    data: {
      invoiceId: remoteStatus.invoiceId,
      invoiceNo: remoteStatus.invoiceNo,
      ettn: remoteStatus.ettn,
      status: localStatus,
      pdfUrl: remoteStatus.pdfUrl,
    },
  })
}

// PATCH /api/efatura/[id] — cancel invoice
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  let body: PatchBody
  try {
    body = (await req.json()) as PatchBody
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON body.' }, { status: 400 })
  }

  const { action, reason } = body

  if (action !== 'cancel') {
    return NextResponse.json(
      { success: false, error: 'Geçersiz action. Desteklenen: "cancel"' },
      { status: 400 }
    )
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'İptal sebebi (reason) zorunlu.' },
      { status: 400 }
    )
  }

  const { data: invoiceData, error: fetchError } = await supabase
    .from('invoices')
    .select('id, external_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !invoiceData) {
    return NextResponse.json({ success: false, error: 'Fatura bulunamadı.' }, { status: 404 })
  }

  const invoice = invoiceData as { id: string; external_id: string | null; status: string }

  if (invoice.status === 'cancelled') {
    return NextResponse.json(
      { success: false, error: 'Fatura zaten iptal edilmiş.' },
      { status: 409 }
    )
  }

  if (!invoice.external_id) {
    return NextResponse.json(
      { success: false, error: 'Bu fatura için harici ID mevcut değil.' },
      { status: 422 }
    )
  }

  try {
    await cancelEFatura(invoice.external_id, reason.trim())
  } catch (err) {
    if (err instanceof Error && err.message === 'NILVERA_API_KEY not configured') {
      return NextResponse.json(
        { success: false, error: 'e-Fatura servisi henüz aktif değil' },
        { status: 503 }
      )
    }
    const msg = err instanceof Error ? err.message : 'Fatura iptal edilemedi.'
    return NextResponse.json({ success: false, error: msg }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Fatura durumu güncellenemedi: ' + updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
