const NILVERA_BASE_URL = process.env.NILVERA_BASE_URL ?? 'https://api.nilvera.com/v1'

export interface EFaturaLine {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number // 0, 1, 8, 10, 18, 20
}

export interface EFaturaRequest {
  receiverVkn: string
  receiverTitle: string
  receiverAddress: string
  lines: EFaturaLine[]
  invoiceDate?: string  // ISO date, default: today
  currency?: string     // default: 'TRY'
  notes?: string
}

export interface EFaturaResult {
  invoiceId: string
  invoiceNo: string
  ettn: string        // UUID assigned by GIB
  status: string
  pdfUrl?: string
}

interface NilveraInvoicePayload {
  receiverVkn: string
  receiverTitle: string
  receiverAddress: string
  invoiceDate: string
  currency: string
  notes?: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: number
    vatRate: number
    lineTotal: number
    vatAmount: number
  }>
}

interface NilveraCreateResponse {
  invoiceId: string
  invoiceNo: string
  ettn: string
  status: string
  pdfUrl?: string
}

interface NilveraStatusResponse {
  invoiceId: string
  invoiceNo: string
  ettn: string
  status: string
  pdfUrl?: string
}

function getApiKey(): string {
  const key = process.env.NILVERA_API_KEY
  if (!key) {
    throw new Error('NILVERA_API_KEY not configured')
  }
  return key
}

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Beklenmeyen hata'
}

export async function createEFatura(req: EFaturaRequest): Promise<EFaturaResult> {
  const apiKey = getApiKey()

  const invoiceDate = req.invoiceDate ?? new Date().toISOString().slice(0, 10)
  const currency = req.currency ?? 'TRY'

  const enrichedLines = req.lines.map((line) => {
    const lineTotal = line.quantity * line.unitPrice
    const vatAmount = lineTotal * (line.vatRate / 100)
    return {
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
      lineTotal,
      vatAmount,
    }
  })

  const payload: NilveraInvoicePayload = {
    receiverVkn: req.receiverVkn,
    receiverTitle: req.receiverTitle,
    receiverAddress: req.receiverAddress,
    invoiceDate,
    currency,
    lines: enrichedLines,
    ...(req.notes ? { notes: req.notes } : {}),
  }

  let res: Response
  try {
    res = await fetch(`${NILVERA_BASE_URL}/invoices`, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new Error(`Nilvera bağlantı hatası: ${getErrorMessage(err)}`)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nilvera API hatası: ${res.status} — ${text.slice(0, 300)}`)
  }

  const data = (await res.json()) as NilveraCreateResponse

  return {
    invoiceId: data.invoiceId,
    invoiceNo: data.invoiceNo,
    ettn: data.ettn,
    status: data.status,
    ...(data.pdfUrl ? { pdfUrl: data.pdfUrl } : {}),
  }
}

export async function getEFaturaStatus(invoiceId: string): Promise<EFaturaResult> {
  const apiKey = getApiKey()

  let res: Response
  try {
    res = await fetch(`${NILVERA_BASE_URL}/invoices/${invoiceId}`, {
      method: 'GET',
      headers: buildHeaders(apiKey),
    })
  } catch (err) {
    throw new Error(`Nilvera bağlantı hatası: ${getErrorMessage(err)}`)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nilvera API hatası: ${res.status} — ${text.slice(0, 300)}`)
  }

  const data = (await res.json()) as NilveraStatusResponse

  return {
    invoiceId: data.invoiceId,
    invoiceNo: data.invoiceNo,
    ettn: data.ettn,
    status: data.status,
    ...(data.pdfUrl ? { pdfUrl: data.pdfUrl } : {}),
  }
}

export async function cancelEFatura(invoiceId: string, reason: string): Promise<void> {
  const apiKey = getApiKey()

  let res: Response
  try {
    res = await fetch(`${NILVERA_BASE_URL}/invoices/${invoiceId}/cancel`, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({ reason }),
    })
  } catch (err) {
    throw new Error(`Nilvera bağlantı hatası: ${getErrorMessage(err)}`)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Nilvera API hatası: ${res.status} — ${text.slice(0, 300)}`)
  }
}
