// Türktrust Mobile İmza REST client
// Env: TURKTRUST_API_KEY, TURKTRUST_BASE_URL (optional)

const DEFAULT_BASE_URL = 'https://api.turktrust.com.tr/v1'

function getConfig(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.TURKTRUST_API_KEY
  if (!apiKey) {
    throw new Error('e-İmza servisi henüz aktif değil')
  }
  const baseUrl = process.env.TURKTRUST_BASE_URL ?? DEFAULT_BASE_URL
  return { apiKey, baseUrl }
}

export interface SignatureRequest {
  documentId: string
  documentHash: string
  documentTitle: string
  signerPhone: string
  signerName: string
  expiresInMinutes?: number
}

export interface SignatureSession {
  sessionId: string
  status: 'pending' | 'completed' | 'rejected' | 'expired'
  otpSent: boolean
  completedAt?: string
  signatureValue?: string
  certificateSerial?: string
}

interface TurktrustInitiateResponse {
  sessionId: string
  status: string
  otpSent: boolean
}

interface TurktrustStatusResponse {
  sessionId: string
  status: string
  otpSent: boolean
  completedAt?: string
  signatureValue?: string
  certificateSerial?: string
}

function mapStatus(
  raw: string
): 'pending' | 'completed' | 'rejected' | 'expired' {
  if (raw === 'completed') return 'completed'
  if (raw === 'rejected') return 'rejected'
  if (raw === 'expired') return 'expired'
  return 'pending'
}

export async function initiateSignature(
  req: SignatureRequest
): Promise<SignatureSession> {
  const { apiKey, baseUrl } = getConfig()

  const body = {
    documentId: req.documentId,
    documentHash: req.documentHash,
    documentTitle: req.documentTitle,
    signerPhone: req.signerPhone,
    signerName: req.signerName,
    expiresInMinutes: req.expiresInMinutes ?? 10,
  }

  const response = await fetch(`${baseUrl}/signature/initiate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Türktrust imza başlatma hatası: ${response.status} ${errorText}`
    )
  }

  const data = (await response.json()) as TurktrustInitiateResponse

  return {
    sessionId: data.sessionId,
    status: mapStatus(data.status),
    otpSent: data.otpSent,
  }
}

export async function getSignatureStatus(
  sessionId: string
): Promise<SignatureSession> {
  const { apiKey, baseUrl } = getConfig()

  const response = await fetch(
    `${baseUrl}/signature/status/${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Türktrust durum sorgulama hatası: ${response.status} ${errorText}`
    )
  }

  const data = (await response.json()) as TurktrustStatusResponse

  return {
    sessionId: data.sessionId,
    status: mapStatus(data.status),
    otpSent: data.otpSent,
    completedAt: data.completedAt,
    signatureValue: data.signatureValue,
    certificateSerial: data.certificateSerial,
  }
}

export async function cancelSignature(sessionId: string): Promise<void> {
  const { apiKey, baseUrl } = getConfig()

  const response = await fetch(
    `${baseUrl}/signature/cancel/${encodeURIComponent(sessionId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Türktrust iptal hatası: ${response.status} ${errorText}`
    )
  }
}
