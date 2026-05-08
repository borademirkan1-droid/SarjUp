import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createEFatura, type EFaturaLine } from '@/lib/efatura'
import type { PartnerRow } from '@/lib/supabase/types'

interface CreateEFaturaBody {
  partnerId?: string
  lines?: EFaturaLine[]
  notes?: string
}

function calcTotals(lines: EFaturaLine[]): {
  subtotal: number
  vatTotal: number
  total: number
} {
  let subtotal = 0
  let vatTotal = 0

  for (const line of lines) {
    const lineTotal = line.quantity * line.unitPrice
    const vatAmount = lineTotal * (line.vatRate / 100)
    subtotal += lineTotal
    vatTotal += vatAmount
  }

  return { subtotal, vatTotal, total: subtotal + vatTotal }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateEFaturaBody
  try {
    body = (await req.json()) as CreateEFaturaBody
  } catch {
    return NextResponse.json({ success: false, error: 'Geçersiz JSON body.' }, { status: 400 })
  }

  const { partnerId, lines, notes } = body

  if (!partnerId || typeof partnerId !== 'string') {
    return NextResponse.json({ success: false, error: 'partnerId zorunlu.' }, { status: 400 })
  }

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json(
      { success: false, error: 'En az bir fatura kalemi (lines) zorunlu.' },
      { status: 400 }
    )
  }

  // Fetch partner to get VKN/title/address
  const { data: partnerData, error: partnerError } = await supabase
    .from('partners')
    .select('id, full_name, tax_number, address, city, district')
    .eq('id', partnerId)
    .single()

  if (partnerError || !partnerData) {
    return NextResponse.json({ success: false, error: 'Partner bulunamadı.' }, { status: 404 })
  }

  const partner = partnerData as Pick<
    PartnerRow,
    'id' | 'full_name' | 'tax_number' | 'address' | 'city' | 'district'
  >

  if (!partner.tax_number) {
    return NextResponse.json(
      { success: false, error: 'Partner VKN/TCKN bilgisi eksik.' },
      { status: 422 }
    )
  }

  const receiverAddress = [partner.address, partner.district, partner.city]
    .filter(Boolean)
    .join(', ')

  let faturaResult
  try {
    faturaResult = await createEFatura({
      receiverVkn: partner.tax_number,
      receiverTitle: partner.full_name,
      receiverAddress,
      lines,
      ...(notes ? { notes } : {}),
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'NILVERA_API_KEY not configured') {
      return NextResponse.json(
        { success: false, error: 'e-Fatura servisi henüz aktif değil' },
        { status: 503 }
      )
    }
    const msg = err instanceof Error ? err.message : 'e-Fatura oluşturulamadı.'
    return NextResponse.json({ success: false, error: msg }, { status: 502 })
  }

  const { subtotal, vatTotal, total } = calcTotals(lines)

  const { data: inserted, error: dbError } = await supabase
    .from('invoices')
    .insert({
      partner_id: partnerId,
      external_id: faturaResult.invoiceId,
      invoice_no: faturaResult.invoiceNo,
      ettn: faturaResult.ettn,
      status: 'sent',
      receiver_vkn: partner.tax_number,
      receiver_title: partner.full_name,
      subtotal,
      vat_total: vatTotal,
      total,
      currency: 'TRY',
      invoice_date: new Date().toISOString().slice(0, 10),
      pdf_url: faturaResult.pdfUrl ?? null,
      lines: lines as unknown as import('@sarjup/types').InvoiceLine[],
      notes: notes ?? null,
    })
    .select('id, invoice_no, ettn, external_id')
    .single()

  if (dbError || !inserted) {
    return NextResponse.json(
      { success: false, error: 'Fatura kaydedilemedi: ' + (dbError?.message ?? 'Bilinmeyen hata') },
      { status: 500 }
    )
  }

  const row = inserted as {
    id: string
    invoice_no: string | null
    ettn: string | null
    external_id: string | null
  }

  return NextResponse.json({
    success: true,
    data: {
      invoiceId: row.external_id,
      invoiceNo: row.invoice_no,
      ettn: row.ettn,
    },
  })
}
