import { createHmac } from 'crypto'
import type { IyzicoPaymentAuthRequest, IyzicoPaymentAuthResponse } from './types'

interface IyzicoConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
}

function getConfig(): IyzicoConfig {
  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  const isSandbox = process.env.IYZICO_SANDBOX !== 'false'

  if (!apiKey || !secretKey) {
    throw new Error('IYZICO_API_KEY veya IYZICO_SECRET_KEY tanımlı değil')
  }

  return {
    apiKey,
    secretKey,
    baseUrl: isSandbox
      ? 'https://sandbox.iyzipay.com'
      : 'https://api.iyzipay.com',
  }
}

export function isIyzicoAvailable(): boolean {
  return !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY)
}

function buildAuthHeaders(config: IyzicoConfig, bodyStr: string): Record<string, string> {
  const randomKey = `${Date.now()}${Math.random().toString(36).slice(2, 10)}`
  const dataToSign = config.apiKey + randomKey + bodyStr
  const signature = createHmac('sha256', config.secretKey)
    .update(dataToSign)
    .digest('base64')

  return {
    Authorization: `IYZWSv2 ${randomKey}:${signature}`,
    'x-iyzi-rnd': randomKey,
    'Content-Type': 'application/json',
  }
}

export async function iyzicoPaymentAuth(
  request: IyzicoPaymentAuthRequest
): Promise<IyzicoPaymentAuthResponse> {
  const config = getConfig()
  const bodyStr = JSON.stringify(request)
  const headers = buildAuthHeaders(config, bodyStr)

  const res = await fetch(`${config.baseUrl}/payment/auth`, {
    method: 'POST',
    headers,
    body: bodyStr,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`iyzico API hatası: ${res.status} — ${text.slice(0, 200)}`)
  }

  return res.json() as Promise<IyzicoPaymentAuthResponse>
}
